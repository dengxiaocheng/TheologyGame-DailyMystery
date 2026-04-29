/**
 * Game4 Daily Mystery - Gameplay Test
 * Tests: scene rendering, time system, observation mode, event triggers, NPC interaction
 * Run: node test-game4.mjs [game-dir]
 */
import { chromium } from 'playwright';
import { resolve } from 'path';

const W = 375, H = 812;
const DIR = process.argv[2] || 'game4-daily-mystery';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: W, height: H }, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));

  const results = { passed: 0, failed: 0, errors: [] };
  function pass(msg) { results.passed++; console.log(`  ✓ ${msg}`); }
  function fail(msg) { results.failed++; results.errors.push(msg); console.log(`  ✗ ${msg}`); }

  try {
    await page.goto(`file://${resolve(DIR, 'index.html')}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    errors.length === 0 ? pass('No JS errors on load') : fail(`JS errors: ${errors.join('; ')}`);

    // 1. Canvas or game area renders
    const gameArea = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (c) {
        const ctx = c.getContext('2d');
        const data = ctx.getImageData(0, 0, Math.min(c.width, 50), Math.min(c.height, 50)).data;
        let nonZero = 0;
        for (let i = 3; i < data.length; i += 4) { if (data[i] > 0) nonZero++; }
        return nonZero > 20 ? `canvas:${c.width}x${c.height}` : `canvas-blank:${c.width}x${c.height}`;
      }
      // Check HTML game area
      const g = document.querySelector('#game, .game, .scene, .game-container');
      if (g) return `html:${g.getBoundingClientRect().width}x${g.getBoundingClientRect().height}`;
      return 'none';
    });
    gameArea !== 'none' ? pass(`Game area: ${gameArea}`) : fail('No game area found');

    // 2. Time system exists
    const hasTime = await page.evaluate(() => {
      if (typeof window.game !== 'undefined' && window.game.time) return 'game.time';
      if (typeof window.timeSystem !== 'undefined') return 'timeSystem';
      if (typeof window.currentTime !== 'undefined') return 'currentTime';
      if (typeof window.time !== 'undefined') return 'window.time';
      // Check DOM for time display
      const timeEl = document.querySelector('.time, #time, .clock, [data-time]');
      if (timeEl) return 'DOM-time';
      return null;
    });
    hasTime ? pass(`Time system found: ${hasTime}`) : fail('No time system found');

    // 3. Map/location system
    const hasMap = await page.evaluate(() => {
      if (typeof window.game !== 'undefined' && window.game.locations) return 'game.locations';
      if (typeof window.locations !== 'undefined') return 'locations';
      if (typeof window.map !== 'undefined') return 'map';
      if (typeof window.currentLocation !== 'undefined') return 'currentLocation';
      return null;
    });
    hasMap ? pass(`Map/location system found: ${hasMap}`) : fail('No map/location system found');

    // 4. Observation/contemplation mode trigger exists
    const hasObserve = await page.evaluate(() => {
      // Check for observation button
      const btn = document.querySelector('.observe, #observe, .contemplate, .gaze, button[data-action="observe"]');
      if (btn) return `button:${btn.tagName}`;
      // Check in game state
      if (typeof window.game !== 'undefined' && window.game.observeMode !== 'undefined') return 'game.observeMode';
      return null;
    });
    hasObserve ? pass(`Observation mode trigger found: ${hasObserve}`) : fail('No observation/contemplation mode trigger found');

    // 5. Event system exists
    const hasEvents = await page.evaluate(() => {
      if (typeof window.game !== 'undefined' && window.game.events) return 'game.events';
      if (typeof window.eventSystem !== 'undefined') return 'eventSystem';
      if (typeof window.events !== 'undefined') return 'events';
      return null;
    });
    hasEvents ? pass(`Event system found: ${hasEvents}`) : fail('No event system found');

    // 6. NPC/character interaction
    const hasNPC = await page.evaluate(() => {
      if (typeof window.game !== 'undefined' && window.game.npcs) return 'game.npcs';
      if (typeof window.npcs !== 'undefined') return 'npcs';
      if (typeof window.npcSystem !== 'undefined') return 'npcSystem';
      // Check for NPC elements in DOM
      const npcEl = document.querySelector('.npc, .character, .person, [data-npc]');
      if (npcEl) return 'DOM-npc';
      return null;
    });
    hasNPC ? pass(`NPC system found: ${hasNPC}`) : fail('No NPC system found');

    // 7. Touch interaction works (tap on game area)
    const touchOk = await page.evaluate(() => {
      const target = document.querySelector('canvas') || document.querySelector('#game') || document.body;
      try {
        const rect = target.getBoundingClientRect();
        const t = new Touch({ identifier: 1, target, clientX: rect.x + rect.width/2, clientY: rect.y + rect.height/2 });
        target.dispatchEvent(new TouchEvent('touchstart', { touches: [t], bubbles: true }));
        target.dispatchEvent(new TouchEvent('touchend', { changedTouches: [t], bubbles: true }));
        return 'ok';
      } catch (e) { return e.message; }
    });
    touchOk === 'ok' ? pass('Touch interaction works') : fail(`Touch failed: ${touchOk}`);

    // 8. No horizontal overflow
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    overflow <= 2 ? pass('No horizontal overflow') : fail(`Overflow: ${overflow}px`);

    // 9. Freeze test: exits must be reachable (period-accessible)
    const exitAccess = await page.evaluate(() => {
      var locId = window.player.getLocation();
      var period = window.timeSystem.getPeriod();
      var exits = window.gameMap.getAvailableExits();
      var results = [];
      for (var i = 0; i < exits.length; i++) {
        var e = exits[i];
        if (e.target === '__end_day__') {
          results.push({ target: e.target, accessible: true });
        } else {
          results.push({ target: e.target, accessible: window.gameMap.isLocationAccessible(e.target, period) });
        }
      }
      return { location: locId, period: period, exits: results };
    });
    var allAccessible = exitAccess.exits.every(e => e.accessible);
    allAccessible
      ? pass(`All exits accessible from ${exitAccess.location} (${exitAccess.period})`)
      : fail(`Inaccessible exits: ${JSON.stringify(exitAccess.exits.filter(e => !e.accessible))}`);

    // 10. Freeze test: advance time to commute and verify exits still work + auto-escape
    await page.evaluate(() => {
      window.timeSystem.addMinutes(60); // advance 1 hour to commute period
    });
    await page.waitForTimeout(500);

    const exitAccess2 = await page.evaluate(() => {
      var period = window.timeSystem.getPeriod();
      var locId = window.player.getLocation();
      var locAccessible = window.gameMap.isLocationAccessible(locId, period);
      var exits = window.gameMap.getAvailableExits(); // triggers auto-escape if needed
      locId = window.player.getLocation(); // may have changed
      var results = [];
      for (var i = 0; i < exits.length; i++) {
        var e = exits[i];
        if (e.target === '__end_day__') {
          results.push({ target: e.target, accessible: true });
        } else {
          results.push({ target: e.target, accessible: window.gameMap.isLocationAccessible(e.target, period) });
        }
      }
      return { period: period, location: locId, locAccessible: locAccessible, exits: results };
    });
    exitAccess2.exits.every(e => e.accessible)
      ? pass(`Exits accessible after time advance (at ${exitAccess2.location}, ${exitAccess2.period})`)
      : fail(`Frozen exits: ${JSON.stringify(exitAccess2.exits.filter(e => !e.accessible))}`);

    // 11. Location change actually works
    const changeResult = await page.evaluate(() => {
      var exits = window.gameMap.getAvailableExits();
      if (exits.length === 0) {
        var loc = window.player.getLocation();
        var period = window.timeSystem.getPeriod();
        var accessible = window.gameMap.isLocationAccessible(loc, period);
        return { ok: accessible, reason: accessible ? 'at accessible location with no exits needed' : 'stuck at ' + loc };
      }
      var target = exits[0].target;
      if (target === '__end_day__') {
        if (exits.length > 1) target = exits[1].target;
        else return { ok: true, reason: 'only end_day exit' };
      }
      var old = window.player.getLocation();
      var ok = window.gameMap.changeLocation(target);
      var now = window.player.getLocation();
      return { ok: ok, old: old, now: now, target: target };
    });
    changeResult.ok !== false
      ? pass(`Location change works: ${JSON.stringify(changeResult)}`)
      : fail(`Location change failed: ${JSON.stringify(changeResult)}`);

  } catch (err) {
    fail(`Fatal: ${err.message}`);
  }

  await ctx.close();
  await browser.close();
  console.log(`\n  Total: ${results.passed} passed, ${results.failed} failed`);
  return results;
}

test().then(r => process.exit(r.failed > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(2); });
