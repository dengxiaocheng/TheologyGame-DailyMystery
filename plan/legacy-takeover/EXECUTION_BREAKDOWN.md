# Execution Breakdown — game4-daily-mystery

Generated: 2026-05-01
Order: Strictly sequential (E-001 → E-002 → E-003)

---

## Packet E-001: Test Hardening

**Goal**: Add automated test for weather rendering to catch BUG-001 regressions.

### Scope
| Item | Detail |
|------|--------|
| Files modified | `test.mjs` (1 file) |
| Max net lines | +25 |
| Bugs addressed | BUG-008 (no weather test) |

### Tasks
1. Add test 12 after existing test 11 in test.mjs:
   - Force weather to `'rainy'` via `window.timeSystem._weather = 'rainy'` (or call exposed setter)
   - Trigger a render cycle via `window.gameMap.render()` or wait for game loop tick
   - Sample canvas pixels in upper region (sky area) — verify non-uniform (gradient applied)
   - Sample canvas pixels in lower region — verify rain particles present (non-zero alpha pixels)
   - Pass if both conditions met, fail otherwise
2. Update test count expectation at bottom of file

### Acceptance Criteria
- [ ] New test 12 passes (weather canvas changes detected)
- [ ] All existing 11 tests still pass
- [ ] `node test.mjs` exits 0

### Test Command
```bash
node test.mjs
```

---

## Packet E-002: P0 Fixes — Weather Mismatch + Exit Filtering

**Goal**: Fix the two blocking bugs that break core gameplay systems.

### Scope
| Item | Detail |
|------|--------|
| Files modified | `js/map-system.js`, `js/ui.js` (2 files) |
| Max net lines | +15 / -10 |
| Bugs addressed | BUG-001 (weather mismatch), BUG-002 (bus exit filtering) |

### Tasks

#### BUG-001: Weather type alignment
1. In `js/map-system.js`, find all comparisons of `weather` against string literals:
   - `'overcast'` → change to `'cloudy'`
   - `'rain'` → change to `'rainy'`
   - Verify no other mismatched weather strings exist
2. In `js/ui.js:521-523`, fix weather icon map:
   - `'overcast'` key → `'cloudy'`
   - `'rain'` key → `'rainy'`
3. Verify all 6 weather types from time-system.js (`'clear'`, `'cloudy'`, `'rainy'`, `'foggy'`, `'windy'`, `'snowy'`) have corresponding handling in both files.

#### BUG-002: Bus stop exit period filtering
1. In `js/map-system.js`, locate `getAvailableExits()` method
2. After the existing `isLocationAccessible(target, period)` check, add:
   ```js
   if (exit.period && exit.period !== period) continue;
   ```
3. This filters out exits that have their own period constraint (e.g., bus boarding only during commute)

### Acceptance Criteria
- [ ] Weather `'cloudy'` triggers overcast sky gradient on canvas
- [ ] Weather `'rainy'` triggers rain particle overlay on canvas
- [ ] Weather icon in UI matches actual weather type
- [ ] Bus stop exits with `period` field only appear during matching period
- [ ] All 12 tests pass (including new test from E-001)

### Test Command
```bash
node test.mjs
```

### Manual Verification
1. Open in browser, force weather to cloudy → verify dimmed sky
2. Force weather to rainy → verify rain particles fall
3. Go to bus_stop during morning → verify bus-related exits shown
4. Go to bus_stop during evening → verify bus exits hidden

---

## Packet E-003: P1 Fixes — Dead Code + UI Cleanup + Reflection

**Goal**: Clean up dead code paths, remove stale DOM elements, fix reflection display.

### Scope
| Item | Detail |
|------|--------|
| Files modified | `js/main.js`, `js/ui.js`, `js/reflection-system.js` (3 files) |
| Max net lines | +20 / -15 |
| Bugs addressed | BUG-003 (dead keyboard paths), BUG-004 (choice-key spans), BUG-005 (reflection filter) |

### Tasks

#### BUG-003: Remove dead keyboard state handlers
1. In `js/main.js`, locate the keyboard event handler
2. Remove switch cases for `gameState === 'narration'`, `'dialog'`, `'choice'` (these states are never set)
3. Keep only the `'playing'` and `'observation'` keyboard handlers (for accessibility)

#### BUG-004: Remove choice-key spans
1. In `js/ui.js:339-341`, remove the code that creates and appends `choice-key` span elements
2. Verify no remaining references to `.choice-key` in JS
3. Verify CSS rule for `.choice-key` can be removed (check no other usage)

#### BUG-005: Fix reflection relationship filter
1. In `js/reflection-system.js:247-249`, the empty `if` block that should filter relationships
2. Add filter logic: only show NPCs where `player.relationships[npcId] !== undefined && player.relationships[npcId].level > 0`
3. Or simpler: filter to NPCs the player has actually interacted with (check dialogue history or relationship delta)

### Acceptance Criteria
- [ ] No dead gameState branches in keyboard handler
- [ ] No `.choice-key` elements in DOM during choice events
- [ ] Reflection screen shows only NPCs the player interacted with
- [ ] All 12 tests pass

### Test Command
```bash
node test.mjs
```

---

## Dependency Graph

```
E-001 (test hardening)
  └── E-002 (P0 fixes) — depends on E-001 for weather test
       └── E-003 (P1 fixes) — independent of E-002 but must be after
```

## Rollback Strategy

Each packet is a single atomic commit. If any packet fails:
1. `git diff` to verify scope
2. `git checkout -- <files>` to revert
3. Re-attempt with narrower scope
4. Escalate after 2 failed attempts
