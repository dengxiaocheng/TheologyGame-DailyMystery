# Legacy Fix Plan — game4-daily-mystery

Generated: 2026-05-01
Status: Ready for execution

---

## Objective

Fix all identified bugs in the "日常神秘" game with minimal, surgical changes. No new features. No refactoring. Preserve existing test passing state.

## Stop Conditions

1. **All 8 bugs in BUG_INVENTORY.md are resolved** (verified by test + manual criteria per bug)
2. **Existing test.mjs continues to pass** (11/11 tests)
3. **No new JS errors on load** (verified by test.mjs test 1)
4. **Net line change across all packets ≤ 200 lines** (current estimate: ~65 lines changed)

## Execution Order

```
Packet 1 (E-001): Test hardening — add weather rendering test
Packet 2 (E-002): P0 fixes — weather mismatch + bus exit filtering
Packet 3 (E-003): P1 fixes — dead code cleanup, choice-key removal, reflection filter
```

Packets are strictly sequential. Each packet must pass all tests before the next begins.

## Architecture Constraints

- **No new files** — all changes are edits to existing files
- **No dependency changes** — no package.json, no new libraries
- **IIFE pattern preserved** — no module conversion
- **Touch-first** — all fixes must preserve mobile-first touch UX
- **Source of truth for weather types**: `js/time-system.js` (defines `'cloudy'`, `'rainy'`, `'foggy'`, `'windy'`, `'snowy'`, `'clear'`)

## Risk Escalation

If any execution packet fails 2 attempts, escalate to manager with:
- Which test failed
- What was attempted
- Screenshot of game state at failure

## Files Touch Budget

| Packet | Files Modified | Max Net Lines |
|--------|---------------|---------------|
| E-001  | 1 (test.mjs)  | +25           |
| E-002  | 2 (map-system.js, ui.js) | +15 |
| E-003  | 3 (main.js, ui.js, reflection-system.js) | +20 |
| **Total** | **4 unique files** | **~60** |

## Verification Protocol

After each packet:
1. Run `node test.mjs` — expect all tests pass
2. Check `git diff --stat` — verify within line budget
3. Visual spot-check: load in browser, verify weather renders, bus stops filter, reflection looks correct
