# Bug Inventory — game4-daily-mystery

Generated: 2026-05-01
Source: Full code review of 10 JS files (~7800 lines) + style.css + index.html + test.mjs

---

## P0 — Blocking (must fix before any feature work)

### BUG-001: Weather type mismatch breaks rain/overcast rendering
- **Files**: `js/map-system.js:352-370`, `js/time-system.js` (weather types), `js/ui.js:521-523`
- **Symptom**: Rain overlay, overcast sky gradient, and building window lights never render. Weather icon in UI shows wrong/missing icon for cloudy and rainy conditions.
- **Root cause**: `time-system.js` defines weather types as `'cloudy'` and `'rainy'`, but `map-system.js` checks for `'overcast'` and `'rain'`. `ui.js` weather icon map also uses `'overcast'`/`'rain'`.
- **Reproducible**: Always. Load game, advance time until weather becomes cloudy or rainy, observe canvas — no rain particles, no dimmed sky.
- **Test evidence**: Visual inspection only. No automated test for weather rendering.
- **Owner**: map-system.js (consumer) must align with time-system.js (source of truth).
- **Fix scope**: ~5 string replacements in map-system.js, ~2 in ui.js. Zero structural changes.

### BUG-002: Bus stop exits not filtered by period
- **Files**: `js/map-system.js` (location definitions for `bus_stop`, `getAvailableExits()`)
- **Symptom**: Exits from bus_stop that have a `period` field on the exit object itself (e.g., conditional bus boarding only during commute) are shown regardless of current period. Player can attempt to board bus at wrong time.
- **Root cause**: `getAvailableExits()` only calls `isLocationAccessible(target, period)` on the target location, but does not check the exit's own `period` constraint.
- **Reproducible**: Always. Go to bus_stop outside commute period, see bus-related exits that shouldn't be available.
- **Test evidence**: test.mjs test 9-10 check exit accessibility via `isLocationAccessible()` but do not test individual exit period filtering.
- **Owner**: map-system.js `getAvailableExits()`.
- **Fix scope**: Add period check on exit objects in `getAvailableExits()`. ~5 lines.

---

## P1 — High (degraded experience, should fix early)

### BUG-003: Dead keyboard paths for narration/dialog/choice states
- **Files**: `js/main.js` keyboard handler
- **Symptom**: Keyboard handler has switch cases for `gameState === 'narration'`, `'dialog'`, `'choice'` but `gameState` is never set to these values during normal play. The touch/click paths use different state names.
- **Root cause**: Touch adaptation in Phase 9 added parallel touch handlers but didn't update gameState values to match keyboard expectations, or vice versa.
- **Reproducible**: Always. Press keyboard keys during narration — no response.
- **Test evidence**: test.mjs test 7 (touch interaction) passes; no keyboard test exists.
- **Owner**: main.js.
- **Fix scope**: Either unify state names across keyboard/touch paths, or remove dead keyboard branches. ~10-15 lines.

### BUG-004: choice-key spans still created in UI
- **Files**: `js/ui.js:339-341`
- **Symptom**: Choice items still append a `choice-key` span element with keyboard shortcut letter, even though Phase 9 report claimed these were removed. The CSS hides them (`display:none` on `.choice-key`) so invisible to user, but DOM pollution and dead event listeners remain.
- **Root cause**: Incomplete removal during Phase 9 mobile adaptation.
- **Reproducible**: Always. Inspect DOM during choice event, see `.choice-key` spans with letters.
- **Test evidence**: test.mjs test 6 checks clickable elements >= 44px (passes because spans are hidden), but doesn't check for dead DOM.
- **Owner**: ui.js.
- **Fix scope**: Remove 3 lines that create choice-key spans. Remove associated `mouseenter` listener code already noted as removed but verify.

### BUG-005: Reflection shows all relationships regardless of change
- **Files**: `js/reflection-system.js:247-249`
- **Symptom**: End-of-day spiritual portrait lists all 12 NPC relationships, not just ones the player interacted with. Empty if block at line 247 means the filtering condition is never applied.
- **Root cause**: Incomplete implementation — if block body is empty, so all NPCs pass through.
- **Reproducible**: Always. Complete a day, view reflection — see all 12 NPCs even if you only talked to 2.
- **Test evidence**: No automated test for reflection content.
- **Owner**: reflection-system.js.
- **Fix scope**: Add filter logic inside the if block. ~3-5 lines.

---

## P2 — Low (cosmetic, edge case, or minor UX)

### BUG-006: Home location only accessible during morning (7:00-8:00)
- **Files**: `js/map-system.js` (home location definition)
- **Symptom**: Player can only be at home during the 'morning' period (7:00-8:00). If they linger or time advances past 8:00, auto-escape triggers immediately. Very narrow window.
- **Root cause**: Design intent unclear — home may be intended only as starting location, but the 1-hour window feels restrictive.
- **Reproducible**: Always. Stay at home past 8:00, get auto-escaped.
- **Test evidence**: test.mjs test 9-10 test exit accessibility and auto-escape but don't validate home period specifically.
- **Owner**: map-system.js (location definition).
- **Fix scope**: Either widen home accessibility to include early_morning, or accept as-by-design. ~1 line if changed.

### BUG-007: Night room dead-end safety net masks real design issues
- **Files**: `js/main.js:378-391`
- **Symptom**: Safety net code forces player to `__end_day__` if stuck at night_room with no exits. This is a band-aid — the real issue is why night_room can become a dead end.
- **Root cause**: Period transition from 'night' to late period may close all exits before player acts.
- **Reproducible**: Rare. Happens if time advances while at night_room during period boundary.
- **Test evidence**: Commit `d2204d2` explicitly fixes "night_room dead end causes game freeze."
- **Owner**: main.js + map-system.js.
- **Fix scope**: Verify night_room always has at least `__end_day__` exit. Remove safety net if root cause fixed. ~10 lines.

### BUG-008: No automated test for weather rendering
- **Files**: `test.mjs`
- **Symptom**: No test verifies that weather effects actually render on canvas. BUG-001 could have been caught earlier.
- **Root cause**: Test suite focuses on system existence, not visual output correctness.
- **Reproducible**: N/A.
- **Test evidence**: N/A.
- **Owner**: test.mjs.
- **Fix scope**: Add 1 test that advances time to trigger weather, checks canvas pixels changed. ~15-20 lines.

---

## Not Bugs (by-design or acceptable)

- **Touch-only input**: Per design spec, keyboard is not primary input. Dead keyboard paths (BUG-003) are low priority.
- **Single-file JS architecture**: No module bundler. IIFE + globals is intentional for simplicity.
- **No package.json**: Game is static HTML+JS. Playwright is assumed installed globally for tests.

---

## Summary

| Severity | Count | Fix Scope (lines) |
|----------|-------|--------------------|
| P0       | 2     | ~10                |
| P1       | 3     | ~25                |
| P2       | 3     | ~30                |
| **Total**| **8** | **~65**            |

All bugs are localized string/logic fixes. No architectural changes needed. No data loss risk.
