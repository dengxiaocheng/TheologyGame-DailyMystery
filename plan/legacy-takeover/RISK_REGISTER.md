# Risk Register — game4-daily-mystery

Generated: 2026-05-01

---

## RISK-001: Weather setter not exposed on TimeSystem
- **Likelihood**: Medium
- **Impact**: Blocks E-001 (weather test)
- **Description**: Test needs to force a specific weather type. If `TimeSystem` doesn't expose a setter or the `_weather` property isn't writable, the test cannot control weather state.
- **Mitigation**: Check time-system.js for public weather API. If none exists, E-001 may need to add a `setWeather(type)` method (increases scope by ~5 lines). Alternatively, test can advance time repeatedly until weather changes and verify canvas differs from baseline.
- **Decision needed**: None — executor can choose mitigation approach.

## RISK-002: Canvas render timing in headless test
- **Likelihood**: Medium
- **Impact**: Flaky E-001 test
- **Description**: Weather particles are animated. Reading canvas pixels at the wrong frame may show no particles even if rendering works.
- **Mitigation**: Test should call render explicitly and/or wait multiple frames. Sample a large region, not individual pixels. Check for any non-zero alpha above a threshold (same approach as existing test 2).
- **Decision needed**: None.

## RISK-003: Bus stop exit period field may not exist on all exits
- **Likelihood**: Low
- **Impact**: BUG-002 fix is no-op (harmless)
- **Description**: The exit objects may or may not have a `period` field. Adding `exit.period && exit.period !== period` is safe — exits without `period` field pass through.
- **Mitigation**: None needed. Guard clause handles both cases.

## RISK-004: Reflection filter may show empty list
- **Likelihood**: Low
- **Impact**: P1 UX issue
- **Description**: If BUG-005 fix is too aggressive (e.g., filters to only NPCs with relationship > 0), and player talked to no one, reflection shows empty relationship section.
- **Mitigation**: Add fallback — if filtered list is empty, show "今天没有与人交谈" (No conversations today) message instead of empty section.
- **Decision needed**: None — executor should include fallback.

## RISK-005: Existing tests may depend on current buggy behavior
- **Likelihood**: Low
- **Impact**: E-002 or E-003 causes test regression
- **Description**: test.mjs checks exit accessibility via `getAvailableExits()`. If BUG-002 fix removes some exits, existing test 9-10 might fail because they expect all exits to be accessible.
- **Mitigation**: Review test.mjs tests 9-10 before E-002. They check `isLocationAccessible()` for each exit's target, not the exit's own period. The fix adds an additional filter, so some exits may disappear — tests should still pass because they check accessibility of targets, not count of exits.
- **Decision needed**: None — but executor must verify tests still pass after E-002.

## RISK-006: data-events.js was only partially reviewed
- **Likelihood**: Low
- **Impact**: Unknown bugs in event data
- **Description**: Due to file size (51K+ tokens), only first ~200 lines of data-events.js were reviewed. Remaining ~600+ lines may contain additional bugs (wrong location IDs, invalid period references, missing choice IDs).
- **Mitigation**: Executor should do a quick grep scan for obviously broken references (e.g., location IDs not in map-system, period names not in time-system) during E-002 or E-003.
- **Decision needed**: None — but if executor finds additional bugs, add to BUG_INVENTORY.md and assess whether to fix in current packets or create new packet.

## RISK-007: Orchestrator left dirty state from incomplete phases
- **Likelihood**: Medium
- **Impact**: Files may be inconsistent
- **Description**: REPORT.md shows Phases 10-11 ran out of context during file expansion. Some JS files may have been partially rewritten (npc-system.js went 196→895 lines). Git shows modified but uncommitted files.
- **Mitigation**: Executor should start from `git stash` or commit current state before making changes. The uncommitted modifications are the current "working" state that passes all tests — do not discard them.
- **Decision needed**: Executor should verify current state passes all tests before starting any packet.

---

## Stop Conditions (Escalate to Manager)

1. **Any test regression that can't be fixed within 2 attempts** — stop and report
2. **Net line change exceeds 200 across all packets** — stop and report
3. **More than 4 files need modification** — stop and report
4. **New P0 bug discovered** — add to inventory, assess, continue only if fix is within scope
5. **Canvas rendering fundamentally broken** (not just weather) — stop, this indicates deeper issue
