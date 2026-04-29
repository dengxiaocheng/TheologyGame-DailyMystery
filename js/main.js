/**
 * Game — 主循环与输入处理
 * 初始化系统、运行游戏循环、处理键盘输入
 * 扩展：氛围事件检查、天气/时间显示更新、空闲检测、面板快捷键
 */
(function () {
  'use strict';

  var gameState = 'title';
  var lastTime = 0;
  var openingShown = false;
  var canvas, ctx;

  // Idle detection
  var _idleTimer = 0;
  var _idleThreshold = 15; // seconds of inactivity before ambient hint
  var _idleHintShown = false;
  var _lastInputTime = 0;

  // Ambient event timer
  var _ambientCheckTimer = 0;
  var _ambientCheckInterval = 10; // check every 10 seconds of play

  // Period change tracking
  var _lastPeriod = null;

  /* ---- Touch Handlers ---- */

  function handleCanvasTouch(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var rect = canvas.getBoundingClientRect();
    var fakeEvent = {
      offsetX: (touch.clientX - rect.left) * (canvas.width / rect.width),
      offsetY: (touch.clientY - rect.top) * (canvas.height / rect.height)
    };
    handleCanvasClick(fakeEvent);
  }

  function handleCanvasClick(e) {
    // Title: click starts game
    if (gameState === 'title') {
      beginPlay();
      return;
    }

    // Reflection: click restarts
    if (gameState === 'reflection') {
      location.reload();
      return;
    }

    // Observation: delegate to observation mode
    if (gameState === 'observation') {
      window.observationMode.handleTouch(e.offsetX, e.offsetY, canvas.width, canvas.height);
      return;
    }

    // Event state: handle narration/choices/result
    if (gameState === 'event') {
      var phase = window.eventSystem.getEventPhase();
      if (phase === 'narration') {
        window.eventSystem.showEventChoices();
      } else if (phase === 'result') {
        window.eventSystem.dismissResult();
        if (!window.eventSystem.isEventActive()) {
          gameState = 'playing';
        } else {
          gameState = 'event';
        }
      }
      return;
    }
  }

  function handleNarrationTap(e) {
    if (window._isInEvent && window._isInEvent()) {
      var phase = window.eventSystem.getEventPhase();
      if (phase === 'narration') {
        window.eventSystem.showEventChoices();
        return;
      }
      if (phase === 'result') {
        window.eventSystem.dismissResult();
        if (!window.eventSystem.isEventActive()) {
          gameState = 'playing';
        } else {
          gameState = 'event';
        }
        return;
      }
    }
    // Default: hide narration, return to playing
    window.ui.hideNarration();
    var exits = window.gameMap.getAvailableExits();
    if (exits.length > 0) window.ui.showExits(exits);
    gameState = 'playing';
  }

  function handleDialogTap(e) {
    window.ui.hideDialog();
    gameState = 'playing';
  }

  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    // Instantiate systems
    window.timeSystem = new TimeSystem();
    window.player = new Player();
    window.ui = new UI(canvas);
    window.gameMap = new GameMap(canvas);
    window.map = window.gameMap; // alias for test compatibility
    window.npcSystem = new NPCSystem(canvas);
    window.eventSystem = new EventSystem();
    window.eventSystem.init();
    window.observationMode = new ObservationMode();
    window.reflectionSystem = new ReflectionSystem();

    // Allow other systems to change gameState
    window._setGameState = function (state) { gameState = state; };

    // Input
    window.addEventListener('keydown', handleKeyDown);

    // Touch input
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('touchstart', handleCanvasTouch, { passive: false });

    document.getElementById('narrationBox').addEventListener('click', handleNarrationTap);
    document.getElementById('dialogBox').addEventListener('click', handleDialogTap);

    document.getElementById('btnObserve').addEventListener('click', function (e) {
      e.stopPropagation();
      if (gameState === 'playing') {
        window.observationMode.toggle();
      }
    });

    document.getElementById('reflectionOverlay').addEventListener('click', function () {
      location.reload();
    });

    // Expose event check for touch handlers
    window._isInEvent = function () { return gameState === 'event'; };

    // Start
    startGame();
    lastTime = performance.now();
    _lastInputTime = lastTime;
    requestAnimationFrame(gameLoop);
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function startGame() {
    gameState = 'title';
    window.timeSystem.pause();
    window.ui.showNarration('又是一天。闹钟响了。光线从窗帘缝隙中挤进来。你睁开眼。');
    openingShown = true;
  }

  function beginPlay() {
    gameState = 'playing';
    window.ui.hideNarration();
    window.timeSystem.resume();

    // Show mood and weather
    window.ui.showMoodIndicator();
    window.ui.showWeatherDisplay();

    // Show home scene and check for morning event
    var loc = window.gameMap.getCurrentLocation();
    window.ui.showNarration(loc.name);
    setTimeout(function () {
      window.ui.hideNarration();

      // Check for event at home
      checkAndTriggerEvent();

      // Only show exits if no event triggered
      if (!window.eventSystem.isEventActive()) {
        var exits = window.gameMap.getAvailableExits();
        if (exits.length > 0) {
          window.ui.showExits(exits);
        }
      }
    }, 1000);
  }

  /**
   * Check for events at current location/period and trigger if found.
   * Returns true if an event was triggered.
   */
  function checkAndTriggerEvent() {
    var locId = window.player.getLocation();
    var period = window.timeSystem.getPeriod();
    var event = window.eventSystem.checkForEvents(locId, period);
    if (event) {
      window.eventSystem.triggerEvent(event);
      gameState = 'event';
      return true;
    }
    return false;
  }

  /**
   * Check for ambient events — atmospheric moments that add texture.
   */
  function checkAmbientEvent() {
    if (!window.eventSystem || !window.eventSystem.checkAmbientEvent) return false;
    var locId = window.player.getLocation();
    var period = window.timeSystem.getPeriod();
    var ambient = window.eventSystem.checkAmbientEvent(locId, period);
    if (ambient && !window.eventSystem.isEventActive()) {
      window.eventSystem.triggerEvent(ambient);
      gameState = 'event';
      return true;
    }
    return false;
  }

  /**
   * Handle period transitions — show ambient description.
   */
  function handlePeriodChange(oldPeriod, newPeriod) {
    if (!window.timeSystem) return;
    var locId = window.player.getLocation();
    var desc = '';
    if (window.timeSystem.getPeriodAmbient) {
      desc = window.timeSystem.getPeriodAmbient();
    } else if (window.timeSystem.getAmbientDescription) {
      desc = window.timeSystem.getAmbientDescription(locId);
    }
    if (desc && gameState === 'playing') {
      window.ui.showNarration(desc);
      setTimeout(function () {
        window.ui.hideNarration();
        // Check for event at new period
        checkAndTriggerEvent();
        if (!window.eventSystem.isEventActive()) {
          var exits = window.gameMap.getAvailableExits();
          if (exits.length > 0) window.ui.showExits(exits);
        }
      }, 2000);
    }
  }

  /**
   * Idle hint — suggest the player to observe or explore.
   */
  function showIdleHint() {
    if (_idleHintShown) return;
    _idleHintShown = true;

    var hints = [
      '你发了一会儿呆。',
      '时间在静静流逝。',
      '也许可以四处看看。',
      '周围似乎有些东西值得注意。'
    ];
    var hint = hints[Math.floor(Math.random() * hints.length)];
    window.ui.showNarration(hint);
    setTimeout(function () {
      window.ui.hideNarration();
      var exits = window.gameMap.getAvailableExits();
      if (exits.length > 0) window.ui.showExits(exits);
    }, 2000);
  }

  function gameLoop(timestamp) {
    var dt = (timestamp - lastTime) / 1000; // seconds
    lastTime = timestamp;

    // Cap delta to avoid huge jumps
    if (dt > 0.1) dt = 0.1;

    // Update time only when playing (not during events/dialog/observation)
    if (gameState === 'playing') {
      var prevPeriod = window.timeSystem.getPeriod();

      window.timeSystem.update(dt); // 1 real second = 1 game minute at rate 1

      // Update cooldowns
      if (window.eventSystem && window.eventSystem.updateCooldowns) {
        window.eventSystem.updateCooldowns(dt);
      }

      // Track period changes
      var curPeriod = window.timeSystem.getPeriod();
      if (prevPeriod !== curPeriod) {
        handlePeriodChange(prevPeriod, curPeriod);
        _lastPeriod = curPeriod;
        // Update weather display
        window.ui.showWeatherDisplay();
      }

      // Idle detection
      _idleTimer += dt;
      if (_idleTimer >= _idleThreshold && !_idleHintShown) {
        showIdleHint();
      }

      // Ambient event checking
      _ambientCheckTimer += dt;
      if (_ambientCheckTimer >= _ambientCheckInterval) {
        _ambientCheckTimer = 0;
        checkAmbientEvent();
      }
    }

    // Update observation mode animation
    if (gameState === 'observation') {
      window.observationMode.update(dt);
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var period = window.timeSystem.getPeriod();
    var locId = window.player.getLocation();

    if (gameState !== 'title' || openingShown) {
      window.gameMap.render(ctx, period);
      // Render NPCs on top of scene
      window.npcSystem.render(ctx, locId, canvas.width, canvas.height);
      // Render observation mode overlay
      if (gameState === 'observation') {
        window.observationMode.render(ctx, canvas.width, canvas.height);
      }
      // Render reflection scene
      if (gameState === 'reflection') {
        window.reflectionSystem.renderScene(ctx, canvas.width, canvas.height, dt);
      }
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Update time display
    if (gameState === 'playing' || gameState === 'event') {
      var loc = window.gameMap.getCurrentLocation();
      window.ui.showTime(window.timeSystem.getDisplayTime(), loc.name);
    }

    // Check day over
    if (gameState === 'playing' && window.timeSystem.isDayOver()) {
      endDay();
    }

    requestAnimationFrame(gameLoop);
  }

  function endDay() {
    gameState = 'reflection';
    window.ui.hideExits();
    window.ui.hideNarration();
    window.ui.hideChoices();
    window.ui.hideMoodIndicator();
    window.ui.hideWeatherDisplay();
    window.timeSystem.pause();

    var content = window.reflectionSystem.generateReflection();
    window.ui.showReflection(content);
  }

  /* ---- Input ---- */

  function handleKeyDown(e) {
    var key = e.key;

    // Reset idle timer on any input
    _idleTimer = 0;
    _idleHintShown = false;

    // Title screen — any key starts play
    if (gameState === 'title') {
      beginPlay();
      return;
    }

    // Reflection — any key restarts
    if (gameState === 'reflection') {
      e.preventDefault();
      location.reload();
      return;
    }

    // Observation state — handle detail navigation/selection
    if (gameState === 'observation') {
      e.preventDefault();
      window.observationMode.handleInput(key);
      return;
    }

    // Event state — handle narration→choices→result flow
    if (gameState === 'event') {
      handleEventInput(e, key);
      return;
    }

    // Escape: close current UI layer (panels > choices > dialog > narration)
    if (key === 'Escape') {
      e.preventDefault();
      // Close panels first
      if (window.ui._inventoryEl && window.ui._inventoryEl.style.display === 'block') {
        window.ui.hideInventory();
        return;
      }
      if (window.ui._journalEl && window.ui._journalEl.style.display === 'block') {
        window.ui.hideJournal();
        return;
      }
      if (window.ui._relEl && window.ui._relEl.style.display === 'block') {
        window.ui.hideRelationships();
        return;
      }
      if (window.ui.choiceMenu.style.display === 'block') {
        window.ui.hideChoices();
        var ex = window.gameMap.getAvailableExits();
        if (ex.length > 0) window.ui.showExits(ex);
        gameState = 'playing';
        return;
      }
      if (window.ui.dialogBox.style.display === 'block') {
        window.ui.hideDialog();
        gameState = 'playing';
        return;
      }
      if (window.ui.narrationBox.style.display === 'block') {
        window.ui.hideNarration();
        var exits = window.gameMap.getAvailableExits();
        if (exits.length > 0) window.ui.showExits(exits);
        gameState = 'playing';
        return;
      }
      return;
    }

    // Narration state — Space/Enter to dismiss
    if (gameState === 'narration') {
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        window.ui.hideNarration();
        var exits = window.gameMap.getAvailableExits();
        if (exits.length > 0) window.ui.showExits(exits);
        gameState = 'playing';
      }
      return;
    }

    // Dialog state — Space/Enter to dismiss
    if (gameState === 'dialog') {
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        window.ui.hideDialog();
        gameState = 'playing';
      }
      return;
    }

    // Choice state — number keys 1-5 to select
    if (gameState === 'choice') {
      var num = parseInt(key, 10);
      if (num >= 1 && num <= window.ui.getChoiceCount()) {
        e.preventDefault();
        var items = window.ui.choiceMenu.querySelectorAll('.choice-item');
        if (items[num - 1]) {
          items[num - 1].click();
        }
      }
      return;
    }

    // Playing state
    if (gameState === 'playing') {
      // G key: toggle observation mode
      if (key === 'g' || key === 'G') {
        e.preventDefault();
        window.observationMode.toggle();
        return;
      }

      // I key: toggle inventory
      if (key === 'i' || key === 'I') {
        e.preventDefault();
        window.ui.toggleInventory();
        return;
      }

      // J key: toggle journal
      if (key === 'j' || key === 'J') {
        e.preventDefault();
        window.ui.toggleJournal();
        return;
      }

      // R key: toggle relationships
      if (key === 'r' || key === 'R') {
        e.preventDefault();
        window.ui.toggleRelationships();
        return;
      }

      // Exit navigation: arrow keys / WASD
      if (window.ui.areExitsVisible()) {
        if (key === 'ArrowUp' || key === 'w' || key === 'W') {
          e.preventDefault();
          window.ui.navigateExits('up');
          return;
        }
        if (key === 'ArrowDown' || key === 's' || key === 'S') {
          e.preventDefault();
          window.ui.navigateExits('down');
          return;
        }
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          window.ui.selectCurrentExit();
          return;
        }
      }
    }
  }

  /* ---- Event Input Handler ---- */

  function handleEventInput(e, key) {
    var phase = window.eventSystem.getEventPhase();

    // Narration phase: Space/Enter advances to choices
    if (phase === 'narration') {
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        window.eventSystem.showEventChoices();
        gameState = 'event';
      }
      return;
    }

    // Choices phase: number keys select a choice
    if (phase === 'choices') {
      var num = parseInt(key, 10);
      if (num >= 1 && num <= window.ui.getChoiceCount()) {
        e.preventDefault();
        var items = window.ui.choiceMenu.querySelectorAll('.choice-item');
        if (items[num - 1]) {
          items[num - 1].click();
        }
      }
      return;
    }

    // Result phase: Space/Enter dismisses and returns to play
    if (phase === 'result') {
      if (key === ' ' || key === 'Enter') {
        e.preventDefault();
        window.eventSystem.dismissResult();
        // Check if another event follows
        if (!window.eventSystem.isEventActive()) {
          gameState = 'playing';
        } else {
          gameState = 'event';
        }
      }
      return;
    }
  }

  // Boot
  document.addEventListener('DOMContentLoaded', init);
})();
