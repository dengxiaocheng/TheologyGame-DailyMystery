/**
 * UI — 用户界面管理
 * 控制所有屏幕UI元素的显示和隐藏
 * 扩展：通知系统、心情指示器、天气显示、物品栏、日志面板、NPC关系面板、过渡动画
 */
(function () {
  'use strict';

  function UI(canvas) {
    this.canvas = canvas;
    this.timeDisplay = document.getElementById('timeDisplay');
    this.gazeIndicator = document.getElementById('gazeIndicator');
    this.dialogBox = document.getElementById('dialogBox');
    this.dialogText = document.getElementById('dialogText');
    this.choiceMenu = document.getElementById('choiceMenu');
    this.narrationBox = document.getElementById('narrationBox');
    this.narrationText = document.getElementById('narrationText');
    this.exitMenu = document.getElementById('exitMenu');
    this.reflectionOverlay = document.getElementById('reflectionOverlay');

    this._exitHighlight = 0;
    this._exitItems = [];
    this._choiceCount = 0;

    // Notification system
    this._notifications = [];
    this._notifContainer = this._createNotifContainer();

    // Mood indicator
    this._moodEl = this._createMoodIndicator();

    // Weather display
    this._weatherEl = this._createWeatherDisplay();

    // Inventory panel
    this._inventoryEl = this._createInventoryPanel();

    // Journal panel
    this._journalEl = this._createJournalPanel();

    // Relationship panel
    this._relEl = this._createRelationshipPanel();

    // Stats panel
    this._statsEl = this._createStatsPanel();

    // Achievement panel
    this._achieveEl = this._createAchievementPanel();

    // Fade state
    this._fadeOverlay = this._createFadeOverlay();
    this._fadeQueue = [];
    this._fading = false;
  }

  /* ---- DOM Element Creation ---- */

  UI.prototype._createNotifContainer = function () {
    var el = document.createElement('div');
    el.className = 'notif-container';
    el.id = 'notifContainer';
    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createMoodIndicator = function () {
    var el = document.createElement('div');
    el.className = 'mood-indicator';
    el.id = 'moodIndicator';
    el.style.display = 'none';
    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createWeatherDisplay = function () {
    var el = document.createElement('div');
    el.className = 'weather-display';
    el.id = 'weatherDisplay';
    el.style.display = 'none';
    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createInventoryPanel = function () {
    var el = document.createElement('div');
    el.className = 'inventory-panel';
    el.id = 'inventoryPanel';
    el.style.display = 'none';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = '物品';
    el.appendChild(header);

    var close = document.createElement('div');
    close.className = 'panel-close';
    close.textContent = '✕';
    var self = this;
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      self.hideInventory();
    });
    header.appendChild(close);

    var list = document.createElement('div');
    list.className = 'inventory-list';
    list.id = 'inventoryList';
    el.appendChild(list);

    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createJournalPanel = function () {
    var el = document.createElement('div');
    el.className = 'journal-panel';
    el.id = 'journalPanel';
    el.style.display = 'none';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = '日志';
    el.appendChild(header);

    var close = document.createElement('div');
    close.className = 'panel-close';
    close.textContent = '✕';
    var self = this;
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      self.hideJournal();
    });
    header.appendChild(close);

    var list = document.createElement('div');
    list.className = 'journal-list';
    list.id = 'journalList';
    el.appendChild(list);

    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createRelationshipPanel = function () {
    var el = document.createElement('div');
    el.className = 'relationship-panel';
    el.id = 'relationshipPanel';
    el.style.display = 'none';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = '人际';
    el.appendChild(header);

    var close = document.createElement('div');
    close.className = 'panel-close';
    close.textContent = '✕';
    var self = this;
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      self.hideRelationships();
    });
    header.appendChild(close);

    var list = document.createElement('div');
    list.className = 'rel-list';
    list.id = 'relList';
    el.appendChild(list);

    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createFadeOverlay = function () {
    var el = document.createElement('div');
    el.className = 'fade-overlay';
    el.id = 'fadeOverlay';
    el.style.display = 'none';
    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createStatsPanel = function () {
    var el = document.createElement('div');
    el.className = 'stats-panel';
    el.id = 'statsPanel';
    el.style.display = 'none';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = '统计';
    el.appendChild(header);

    var close = document.createElement('div');
    close.className = 'panel-close';
    close.textContent = '✕';
    var self = this;
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      self.hideStats();
    });
    header.appendChild(close);

    var content = document.createElement('div');
    content.className = 'stats-content';
    content.id = 'statsContent';
    el.appendChild(content);

    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  UI.prototype._createAchievementPanel = function () {
    var el = document.createElement('div');
    el.className = 'achievement-panel';
    el.id = 'achievementPanel';
    el.style.display = 'none';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.textContent = '成就';
    el.appendChild(header);

    var close = document.createElement('div');
    close.className = 'panel-close';
    close.textContent = '✕';
    var self = this;
    close.addEventListener('click', function (e) {
      e.stopPropagation();
      self.hideAchievements();
    });
    header.appendChild(close);

    var list = document.createElement('div');
    list.className = 'achieve-list';
    list.id = 'achieveList';
    el.appendChild(list);

    document.getElementById('ui-overlay').appendChild(el);
    return el;
  };

  /* ---- Time Display ---- */

  UI.prototype.showTime = function (timeStr, locationName) {
    // Enhanced: includes weather and mood info
    var weatherStr = '';
    if (window.timeSystem && window.timeSystem.getWeatherLabel) {
      weatherStr = '<div class="weather-text">' + window.timeSystem.getWeatherLabel() + '</div>';
    }

    var moodStr = '';
    if (window.player) {
      var mood = window.player.getMood();
      var moodLabel = window.player.getMoodLabel();
      var moodColor = window.player.getMoodColor();
      moodStr = '<div class="mood-text" style="color:' + moodColor + '">' + moodLabel + '</div>';
    }

    this.timeDisplay.innerHTML = timeStr +
      '<div class="location-name">' + locationName + '</div>' +
      weatherStr + moodStr;
    this.timeDisplay.style.display = 'block';
  };

  UI.prototype.hideTime = function () {
    this.timeDisplay.style.display = 'none';
  };

  /* ---- Gaze Indicator ---- */

  UI.prototype.showGaze = function () {
    this.gazeIndicator.style.display = 'block';
  };

  UI.prototype.hideGaze = function () {
    this.gazeIndicator.style.display = 'none';
  };

  /* ---- Narration ---- */

  UI.prototype.showNarration = function (text) {
    this.narrationText.textContent = text;
    this.narrationBox.style.display = 'block';
    this.narrationBox.classList.remove('narration-fade-out');
    this.narrationBox.classList.add('narration-fade-in');
  };

  UI.prototype.hideNarration = function () {
    var self = this;
    this.narrationBox.classList.remove('narration-fade-in');
    this.narrationBox.classList.add('narration-fade-out');
    setTimeout(function () {
      self.narrationBox.style.display = 'none';
      self.narrationBox.classList.remove('narration-fade-out');
    }, 300);
  };

  UI.prototype.isNarrationVisible = function () {
    return this.narrationBox.style.display === 'block';
  };

  /* ---- Dialog ---- */

  UI.prototype.showDialog = function (speaker, text) {
    // Clear previous content
    this.dialogBox.innerHTML = '';
    if (speaker) {
      var nameEl = document.createElement('div');
      nameEl.className = 'speaker-name';
      nameEl.textContent = speaker;
      this.dialogBox.appendChild(nameEl);
    }
    var textEl = document.createElement('p');
    textEl.textContent = text;
    this.dialogBox.appendChild(textEl);
    this.dialogText = textEl;
    this.dialogBox.style.display = 'block';
  };

  UI.prototype.hideDialog = function () {
    this.dialogBox.style.display = 'none';
  };

  /* ---- Choices ---- */

  UI.prototype.showChoices = function (choices, onSelect) {
    var self = this;
    this.choiceMenu.innerHTML = '';
    this._choiceCount = choices.length;

    choices.forEach(function (choice, i) {
      var item = document.createElement('div');
      item.className = 'choice-item';
      item.dataset.choiceId = choice.id;
      item.dataset.index = i;

      // Key hint for desktop
      var keyHint = document.createElement('span');
      keyHint.className = 'choice-key';
      keyHint.textContent = (i + 1);
      item.appendChild(keyHint);

      item.appendChild(document.createTextNode(choice.text));

      item.addEventListener('click', function () {
        onSelect(choice.id);
      });

      self.choiceMenu.appendChild(item);
    });
    this.choiceMenu.style.display = 'block';
  };

  UI.prototype.hideChoices = function () {
    this.choiceMenu.innerHTML = '';
    this.choiceMenu.style.display = 'none';
    this._choiceCount = 0;
  };

  UI.prototype._highlightChoice = function (index) {
    var items = this.choiceMenu.querySelectorAll('.choice-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('highlighted', i === index);
    }
  };

  UI.prototype.getChoiceCount = function () {
    return this._choiceCount;
  };

  /* ---- Exits ---- */

  UI.prototype.showExits = function (exits) {
    var self = this;
    this.exitMenu.innerHTML = '';
    this._exitItems = exits;
    this._exitHighlight = 0;

    exits.forEach(function (exit, i) {
      var item = document.createElement('div');
      item.className = 'exit-item';
      item.dataset.target = exit.target;
      item.dataset.index = i;

      item.textContent = exit.label;

      item.addEventListener('click', function () {
        self.fadeTransition(function () {
          window.gameMap.changeLocation(exit.target);
        });
      });

      self.exitMenu.appendChild(item);
    });

    this._updateExitHighlight();
    this.exitMenu.style.display = 'block';
  };

  UI.prototype.hideExits = function () {
    this.exitMenu.innerHTML = '';
    this.exitMenu.style.display = 'none';
    this._exitItems = [];
  };

  UI.prototype._updateExitHighlight = function () {
    var items = this.exitMenu.querySelectorAll('.exit-item');
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('highlighted', i === this._exitHighlight);
    }
  };

  UI.prototype.navigateExits = function (direction) {
    if (this._exitItems.length === 0) return;
    if (direction === 'up' || direction === 'left') {
      this._exitHighlight = (this._exitHighlight - 1 + this._exitItems.length) % this._exitItems.length;
    } else if (direction === 'down' || direction === 'right') {
      this._exitHighlight = (this._exitHighlight + 1) % this._exitItems.length;
    }
    this._updateExitHighlight();
  };

  UI.prototype.selectCurrentExit = function () {
    if (this._exitItems.length === 0) return;
    var exit = this._exitItems[this._exitHighlight];
    if (exit) {
      this.fadeTransition(function () {
        window.gameMap.changeLocation(exit.target);
      });
    }
  };

  UI.prototype.areExitsVisible = function () {
    return this.exitMenu.style.display === 'block';
  };

  /* ---- Reflection ---- */

  UI.prototype.showReflection = function (content) {
    this.reflectionOverlay.innerHTML = content;
    this.reflectionOverlay.style.display = 'block';
    this.reflectionOverlay.classList.add('reflection-fade-in');
  };

  UI.prototype.hideReflection = function () {
    this.reflectionOverlay.style.display = 'none';
    this.reflectionOverlay.classList.remove('reflection-fade-in');
  };

  /* ---- Notification / Toast System ---- */

  UI.prototype.showNotification = function (title, body) {
    var notif = document.createElement('div');
    notif.className = 'notif-item';
    notif.innerHTML = '<div class="notif-title">' + title + '</div>' +
      (body ? '<div class="notif-body">' + body + '</div>' : '');

    this._notifContainer.appendChild(notif);

    // Trigger animation
    var self = this;
    setTimeout(function () {
      notif.classList.add('notif-show');
    }, 10);

    // Auto-remove after 3 seconds
    setTimeout(function () {
      notif.classList.remove('notif-show');
      notif.classList.add('notif-hide');
      setTimeout(function () {
        if (notif.parentNode) {
          notif.parentNode.removeChild(notif);
        }
      }, 400);
    }, 3000);
  };

  /* ---- Mood Indicator ---- */

  UI.prototype.showMoodIndicator = function () {
    if (!window.player) return;
    var mood = window.player.getMood();
    var label = window.player.getMoodLabel();
    var color = window.player.getMoodColor();
    this._moodEl.innerHTML = '<div class="mood-dot" style="background:' + color + '"></div>' +
      '<span>' + label + '</span>';
    this._moodEl.style.display = 'flex';
  };

  UI.prototype.hideMoodIndicator = function () {
    this._moodEl.style.display = 'none';
  };

  UI.prototype.updateMoodIndicator = function () {
    this.showMoodIndicator();
  };

  /* ---- Weather Display ---- */

  UI.prototype.showWeatherDisplay = function () {
    if (!window.timeSystem) return;
    var weather = window.timeSystem.getWeatherLabel();
    var temp = '';
    if (window.timeSystem.getTemperature) {
      temp = window.timeSystem.getTemperature() + '°';
    }
    this._weatherEl.innerHTML = '<span class="weather-icon">' + this._weatherIcon() + '</span>' +
      '<span>' + weather + '</span>' +
      (temp ? '<span class="weather-temp">' + temp + '</span>' : '');
    this._weatherEl.style.display = 'flex';
  };

  UI.prototype.hideWeatherDisplay = function () {
    this._weatherEl.style.display = 'none';
  };

  UI.prototype._weatherIcon = function () {
    if (!window.timeSystem || !window.timeSystem.getWeather) return '';
    var w = window.timeSystem.getWeather();
    var icons = {
      clear: '☀', cloudy: '☁', overcast: '☁', rain: '🌧',
      heavy_rain: '🌧', drizzle: '🌦', snow: '❄', fog: '🌫',
      windy: '💨', dust: '🌀', haze: '🌫'
    };
    return icons[w] || '○';
  };

  /* ---- Inventory Panel ---- */

  UI.prototype.showInventory = function () {
    var list = document.getElementById('inventoryList');
    list.innerHTML = '';

    if (!window.player) return;
    var inv = window.player.getInventory();
    if (inv.length === 0) {
      list.innerHTML = '<div class="empty-text">还没有收集到任何物品。</div>';
    } else {
      for (var i = 0; i < inv.length; i++) {
        var item = document.createElement('div');
        item.className = 'inv-entry';
        item.innerHTML = '<span class="inv-name">' + inv[i].name + '</span>' +
          (inv[i].desc ? '<span class="inv-desc">' + inv[i].desc + '</span>' : '');
        list.appendChild(item);
      }
    }
    this._inventoryEl.style.display = 'block';
  };

  UI.prototype.hideInventory = function () {
    this._inventoryEl.style.display = 'none';
  };

  UI.prototype.toggleInventory = function () {
    if (this._inventoryEl.style.display === 'block') {
      this.hideInventory();
    } else {
      this.showInventory();
    }
  };

  /* ---- Journal Panel ---- */

  UI.prototype.showJournal = function () {
    var list = document.getElementById('journalList');
    list.innerHTML = '';

    if (!window.player) return;
    var journal = window.player.getJournal();
    if (journal.length === 0) {
      list.innerHTML = '<div class="empty-text">还没有日志记录。</div>';
    } else {
      // Show most recent first
      for (var i = journal.length - 1; i >= 0; i--) {
        var entry = document.createElement('div');
        entry.className = 'journal-entry';
        entry.innerHTML = '<span class="journal-time">' + journal[i].time + '</span>' +
          '<span class="journal-text">' + journal[i].text + '</span>';
        list.appendChild(entry);
      }
    }
    this._journalEl.style.display = 'block';
  };

  UI.prototype.hideJournal = function () {
    this._journalEl.style.display = 'none';
  };

  UI.prototype.toggleJournal = function () {
    if (this._journalEl.style.display === 'block') {
      this.hideJournal();
    } else {
      this.showJournal();
    }
  };

  /* ---- Relationship Panel ---- */

  UI.prototype.showRelationships = function () {
    var list = document.getElementById('relList');
    list.innerHTML = '';

    if (!window.player) return;
    var rels = window.player.getAllRelationships();
    var labels = {
      mother: '母亲', elderly_bus: '公交上的老人', silent_woman: '沉默的女人',
      colleague_li: '同事李', colleague_wang: '同事王', lunch_friend: '午餐朋友',
      beggar: '街边的乞丐', park_stranger: '公园的陌生人', neighbor_auntie: '邻居阿姨',
      boss: '老板', barista: '咖啡师', street_cat: '街猫'
    };

    for (var npcId in rels) {
      if (!rels.hasOwnProperty(npcId)) continue;
      var val = rels[npcId];
      var name = labels[npcId] || npcId;

      var row = document.createElement('div');
      row.className = 'rel-entry';

      // Relationship bar
      var barLen = Math.round(val / 10);
      var barStr = '';
      for (var b = 0; b < 10; b++) {
        barStr += b < barLen ? '■' : '□';
      }

      row.innerHTML = '<span class="rel-name">' + name + '</span>' +
        '<span class="rel-bar">' + barStr + '</span>' +
        '<span class="rel-val">' + val + '</span>';
      list.appendChild(row);
    }
    this._relEl.style.display = 'block';
  };

  UI.prototype.hideRelationships = function () {
    this._relEl.style.display = 'none';
  };

  UI.prototype.toggleRelationships = function () {
    if (this._relEl.style.display === 'block') {
      this.hideRelationships();
    } else {
      this.showRelationships();
    }
  };

  /* ---- Stats Panel ---- */

  UI.prototype.showStats = function () {
    var content = document.getElementById('statsContent');
    content.innerHTML = '';

    if (!window.player) return;
    var profile = window.player.getProfile ? window.player.getProfile() : {};
    var stats = window.player.getStats ? window.player.getStats() : {};

    // Depth score
    var depth = window.player.getDepth ? window.player.getDepth() : 0;
    var depthRow = document.createElement('div');
    depthRow.className = 'stat-row';
    depthRow.innerHTML = '<span class="stat-label">深度</span><span class="stat-value">' + depth + '</span>';
    content.appendChild(depthRow);

    // Choices count
    var choiceCount = stats.totalChoices || 0;
    var choiceRow = document.createElement('div');
    choiceRow.className = 'stat-row';
    choiceRow.innerHTML = '<span class="stat-label">选择次数</span><span class="stat-value">' + choiceCount + '</span>';
    content.appendChild(choiceRow);

    // Observation count
    var obsCount = window.observationMode ? window.observationMode.getDiscoveredCount() : 0;
    var obsRow = document.createElement('div');
    obsRow.className = 'stat-row';
    obsRow.innerHTML = '<span class="stat-label">观察发现</span><span class="stat-value">' + obsCount + '</span>';
    content.appendChild(obsRow);

    // Items collected
    var inv = window.player.getInventory ? window.player.getInventory() : [];
    var itemRow = document.createElement('div');
    itemRow.className = 'stat-row';
    itemRow.innerHTML = '<span class="stat-label">收集物品</span><span class="stat-value">' + inv.length + '</span>';
    content.appendChild(itemRow);

    // Journal entries
    var journal = window.player.getJournal ? window.player.getJournal() : [];
    var journalRow = document.createElement('div');
    journalRow.className = 'stat-row';
    journalRow.innerHTML = '<span class="stat-label">日志条目</span><span class="stat-value">' + journal.length + '</span>';
    content.appendChild(journalRow);

    // Relationships count
    var rels = window.player.getAllRelationships ? window.player.getAllRelationships() : {};
    var relCount = 0;
    for (var k in rels) {
      if (rels.hasOwnProperty(k) && rels[k] > 0) relCount++;
    }
    var relRow = document.createElement('div');
    relRow.className = 'stat-row';
    relRow.innerHTML = '<span class="stat-label">认识的人</span><span class="stat-value">' + relCount + '</span>';
    content.appendChild(relRow);

    // Flags count
    var flags = window.player._flags || {};
    var flagCount = 0;
    for (var f in flags) {
      if (flags.hasOwnProperty(f)) flagCount++;
    }
    var flagRow = document.createElement('div');
    flagRow.className = 'stat-row';
    flagRow.innerHTML = '<span class="stat-label">记忆标记</span><span class="stat-value">' + flagCount + '</span>';
    content.appendChild(flagRow);

    this._statsEl.style.display = 'block';
  };

  UI.prototype.hideStats = function () {
    this._statsEl.style.display = 'none';
  };

  UI.prototype.toggleStats = function () {
    if (this._statsEl.style.display === 'block') {
      this.hideStats();
    } else {
      this.showStats();
    }
  };

  /* ---- Achievement Panel ---- */

  UI.prototype.showAchievements = function () {
    var list = document.getElementById('achieveList');
    list.innerHTML = '';

    if (!window.player) return;

    var achievements = [
      { id: 'first_observation', name: '初次观察', desc: '第一次发现隐藏的细节', flag: null },
      { id: 'observer_5', name: '敏锐之眼', desc: '发现5个隐藏细节', flag: null },
      { id: 'observer_10', name: '洞察一切', desc: '发现10个隐藏细节', flag: null },
      { id: 'first_choice', name: '选择者', desc: '做出第一个选择', flag: null },
      { id: 'deep_thinker', name: '深思者', desc: '深度分数达到20', flag: null },
      { id: 'explorer', name: '探索者', desc: '访问所有地点', flag: null },
      { id: 'collector', name: '收藏家', desc: '收集5件物品', flag: null },
      { id: 'diarist', name: '日记作者', desc: '写下10条日志', flag: null },
      { id: 'social', name: '社交者', desc: '与3个人建立关系', flag: null },
      { id: 'night_owl', name: '夜行者', desc: '在夜晚发现3个细节', flag: null }
    ];

    for (var i = 0; i < achievements.length; i++) {
      var ach = achievements[i];
      var unlocked = window.player.checkAchievement && window.player.checkAchievement(ach.id);
      var row = document.createElement('div');
      row.className = 'achieve-entry' + (unlocked ? ' achieved' : ' locked');
      row.innerHTML = '<div class="achieve-name">' + ach.name + '</div>' +
        '<div class="achieve-desc">' + ach.desc + '</div>' +
        (unlocked ? '<div class="achieve-check">✓</div>' : '<div class="achieve-lock">?</div>');
      list.appendChild(row);
    }

    this._achieveEl.style.display = 'block';
  };

  UI.prototype.hideAchievements = function () {
    this._achieveEl.style.display = 'none';
  };

  UI.prototype.toggleAchievements = function () {
    if (this._achieveEl.style.display === 'block') {
      this.hideAchievements();
    } else {
      this.showAchievements();
    }
  };

  /* ---- Progress Indicator ---- */

  UI.prototype.showProgress = function () {
    if (!window.player || !window.timeSystem) return;
    var depth = window.player.getDepth ? window.player.getDepth() : 0;
    var maxDepth = 100;
    var pct = Math.min(100, Math.round(depth / maxDepth * 100));

    this.showNotification('进度', '深度 ' + depth + ' / ' + maxDepth + '（' + pct + '%）');
  };

  /* ---- Period Transition Hint ---- */

  UI.prototype.showPeriodHint = function (period) {
    var hints = {
      morning: '新的一天开始了。窗外的阳光在等你。',
      commute: '公交车来了。找一个靠窗的位置。',
      work: '办公室安静地等着你。桌上的文件还和昨天一样。',
      lunch: '午休时间。也许该出去走走。',
      afternoon: '下午的光线变得柔和。时间在不知不觉中流走。',
      'commute-home': '回家的路上。车窗外是渐暗的天色。',
      evening: '傍晚。街灯亮了。这个世界变得温柔了一些。',
      night: '夜深了。剩下的一切都可以明天再说。'
    };
    var hint = hints[period] || '';
    if (hint) {
      this.showNotification('时段', hint);
    }
  };

  /* ---- Help Overlay ---- */

  UI.prototype.showHelp = function () {
    var helpLines = [
      '← → ↑ ↓ 或 WASD：导航选择',
      '空格/回车：确认',
      'G：凝视/观察模式',
      'I：物品栏',
      'J：日志',
      'R：人际关系',
      'S：统计',
      'A：成就',
      'ESC：返回/关闭'
    ];
    this.showNarration(helpLines.join('\n'));
  };

  /* ---- Close All Panels ---- */

  UI.prototype.closeAllPanels = function () {
    this.hideInventory();
    this.hideJournal();
    this.hideRelationships();
    this.hideStats();
    this.hideAchievements();
  };

  /* ---- Check if any panel is open ---- */

  UI.prototype.isPanelOpen = function () {
    return this._inventoryEl.style.display === 'block' ||
      this._journalEl.style.display === 'block' ||
      this._relEl.style.display === 'block' ||
      this._statsEl.style.display === 'block' ||
      this._achieveEl.style.display === 'block';
  };

  /* ---- Fade Transition ---- */

  UI.prototype.fadeTransition = function (callback) {
    var self = this;
    this._fadeOverlay.style.display = 'block';
    this._fadeOverlay.style.opacity = '0';
    this._fadeOverlay.classList.add('fade-in');

    setTimeout(function () {
      if (callback) callback();
      setTimeout(function () {
        self._fadeOverlay.classList.remove('fade-in');
        self._fadeOverlay.classList.add('fade-out');
        setTimeout(function () {
          self._fadeOverlay.style.display = 'none';
          self._fadeOverlay.classList.remove('fade-out');
        }, 300);
      }, 100);
    }, 300);
  };

  /* ---- Clear All ---- */

  UI.prototype.clear = function () {
    this.hideDialog();
    this.hideChoices();
    this.hideNarration();
    this.hideExits();
    this.hideMoodIndicator();
    this.hideWeatherDisplay();
    this.hideInventory();
    this.hideJournal();
    this.hideRelationships();
    this.hideStats();
    this.hideAchievements();
  };

  window.UI = UI;
})();
