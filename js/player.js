/**
 * Player — 玩家状态管理
 * 深度分数、选择记录、NPC关系、心情、日志、成就、记忆
 */
(function () {
  'use strict';

  var MAX_DEPTH = 100;
  var MAX_RELATIONSHIP = 100;
  var MAX_MOOD = 100;

  var DEFAULT_RELATIONSHIPS = {
    mother: 50,
    elderly_bus: 30,
    silent_woman: 20,
    colleague_li: 40,
    colleague_wang: 35,
    lunch_friend: 45,
    beggar: 15,
    park_stranger: 10,
    neighbor_auntie: 25,
    boss: 30,
    barista: 20,
    street_cat: 10
  };

  var MOOD_THRESHOLDS = {
    heavy:     { max: 20, label: '沉重', color: '#808090' },
    low:       { max: 40, label: '低落', color: '#9090a0' },
    neutral:   { max: 60, label: '平静', color: '#b0b0b0' },
    elevated:  { max: 80, label: '温和', color: '#c0c0a0' },
    bright:    { max: 100, label: '明朗', color: '#d0c890' }
  };

  var ACHIEVEMENT_DEFS = {
    first_observation: { name: '初见', desc: '第一次凝视世界' },
    deep_observer: { name: '凝视者', desc: '发现20个细节' },
    kind_heart: { name: '温柔的心', desc: '帮助5个人' },
    patience: { name: '从容', desc: '停留10次以上' },
    walker: { name: '行者', desc: '走遍所有地点' },
    listener: { name: '倾听者', desc: '与所有NPC交谈' },
    all_weather: { name: '四季', desc: '经历所有天气' },
    early_bird: { name: '早起的人', desc: '在清晨做出选择' },
    night_owl: { name: '夜行人', desc: '在夜晚做出选择' },
    full_journal: { name: '记录者', desc: '日志超过10条' },
    depth_master: { name: '深度旅者', desc: '深度分数超过80' },
    all_portraits: { name: '五面之镜', desc: '解锁所有精神肖像' }
  };

  function Player() {
    this._depthScore = 0;
    this._choicesMade = 0;
    this._currentLocation = 'home';
    this._flags = {};
    this._stats = {
      peopleHelped: 0,
      timesPaused: 0,
      conversationsHad: 0,
      thingsObserved: 0,
      timesRushed: 0,
      locationsVisited: 1,
      momentsOfKindness: 0,
      momentsOfReflection: 0,
      choicesByCategory: {}
    };
    this._relationships = {};
    this._mood = 60;
    this._journal = [];
    this._achievements = {};
    this._memories = [];
    this._inventory = [];
    this._locationsVisited = { home: true };
    this._weatherSeen = {};
    this._portraitUnlocked = {};
    this._initRelationships();
  }

  Player.prototype._initRelationships = function () {
    for (var key in DEFAULT_RELATIONSHIPS) {
      this._relationships[key] = DEFAULT_RELATIONSHIPS[key];
    }
  };

  /* ---- Depth Score ---- */

  Player.prototype.getDepth = function () {
    return this._depthScore;
  };

  Player.prototype.addDepth = function (amount) {
    this._depthScore += amount;
    if (this._depthScore > MAX_DEPTH) this._depthScore = MAX_DEPTH;
    if (this._depthScore < 0) this._depthScore = 0;
  };

  /* ---- Choices ---- */

  Player.prototype.recordChoice = function (choiceId, category) {
    this._choicesMade++;
    if (category) {
      if (!this._stats.choicesByCategory[category]) {
        this._stats.choicesByCategory[category] = 0;
      }
      this._stats.choicesByCategory[category]++;
    }
    this._adjustMoodFromChoice(category);
  };

  Player.prototype.getChoicesMade = function () {
    return this._choicesMade;
  };

  /* ---- Flags ---- */

  Player.prototype.setFlag = function (flag) {
    this._flags[flag] = true;
  };

  Player.prototype.hasFlag = function (flag) {
    return !!this._flags[flag];
  };

  Player.prototype.getFlags = function () {
    return this._flags;
  };

  /* ---- Location ---- */

  Player.prototype.getLocation = function () {
    return this._currentLocation;
  };

  Player.prototype.setLocation = function (locId) {
    this._currentLocation = locId;
    if (!this._locationsVisited[locId]) {
      this._locationsVisited[locId] = true;
      this._stats.locationsVisited++;
      this.addDepth(2);
      this.checkAchievement('walker', this._stats.locationsVisited >= 7);
    }
  };

  /* ---- Stats ---- */

  Player.prototype.getStats = function () {
    return this._stats;
  };

  Player.prototype.incrementStat = function (statName) {
    if (typeof this._stats[statName] === 'number') {
      this._stats[statName]++;
    }
    if (statName === 'peopleHelped') {
      this.checkAchievement('kind_heart', this._stats.peopleHelped >= 5);
    }
    if (statName === 'timesPaused') {
      this.checkAchievement('patience', this._stats.timesPaused >= 10);
    }
  };

  /* ---- Relationships ---- */

  Player.prototype.getRelationship = function (npcId) {
    return this._relationships[npcId] || 0;
  };

  Player.prototype.getAllRelationships = function () {
    var result = {};
    for (var key in this._relationships) {
      result[key] = this._relationships[key];
    }
    return result;
  };

  Player.prototype.updateRelationship = function (npcId, delta) {
    if (typeof this._relationships[npcId] === 'undefined') {
      this._relationships[npcId] = 30;
    }
    this._relationships[npcId] += delta;
    if (this._relationships[npcId] > MAX_RELATIONSHIP) this._relationships[npcId] = MAX_RELATIONSHIP;
    if (this._relationships[npcId] < 0) this._relationships[npcId] = 0;
    this._checkRelationshipThresholds(npcId);
  };

  Player.prototype._checkRelationshipThresholds = function (npcId) {
    var v = this._relationships[npcId];
    if (v >= 80) {
      this.addJournalEntry('与' + this._npcLabel(npcId) + '的关系变得更深了。');
    }
  };

  Player.prototype._npcLabel = function (id) {
    var labels = {
      mother: '母亲', elderly_bus: '公交上的老人', silent_woman: '沉默的女人',
      colleague_li: '同事李', colleague_wang: '同事王', lunch_friend: '午餐朋友',
      beggar: '街边的乞丐', park_stranger: '公园的陌生人', neighbor_auntie: '邻居阿姨',
      boss: '老板', barista: '咖啡师', street_cat: '街猫'
    };
    return labels[id] || id;
  };

  /* ---- Mood ---- */

  Player.prototype.getMood = function () {
    return this._mood;
  };

  Player.prototype.adjustMood = function (delta) {
    this._mood += delta;
    if (this._mood > MAX_MOOD) this._mood = MAX_MOOD;
    if (this._mood < 0) this._mood = 0;
  };

  Player.prototype.getMoodLabel = function () {
    for (var key in MOOD_THRESHOLDS) {
      if (this._mood <= MOOD_THRESHOLDS[key].max) {
        return MOOD_THRESHOLDS[key].label;
      }
    }
    return '明朗';
  };

  Player.prototype.getMoodColor = function () {
    for (var key in MOOD_THRESHOLDS) {
      if (this._mood <= MOOD_THRESHOLDS[key].max) {
        return MOOD_THRESHOLDS[key].color;
      }
    }
    return '#d0c890';
  };

  Player.prototype._adjustMoodFromChoice = function (category) {
    switch (category) {
      case 'kindness':  this.adjustMood(5);  break;
      case 'rushed':    this.adjustMood(-3); break;
      case 'observant': this.adjustMood(2);  break;
      case 'reflective': this.adjustMood(3); break;
      case 'avoidant':  this.adjustMood(-2); break;
      case 'brave':     this.adjustMood(4);  break;
      case 'honest':    this.adjustMood(2);  break;
    }
  };

  /* ---- Journal ---- */

  Player.prototype.addJournalEntry = function (text) {
    var timeStr = window.timeSystem ? window.timeSystem.getDisplayTime() : '07:00';
    this._journal.push({ time: timeStr, text: text });
    this.checkAchievement('full_journal', this._journal.length >= 10);
  };

  Player.prototype.getJournal = function () {
    return this._journal.slice();
  };

  Player.prototype.getJournalCount = function () {
    return this._journal.length;
  };

  /* ---- Achievements ---- */

  Player.prototype.checkAchievement = function (id, condition) {
    if (condition && !this._achievements[id]) {
      this._achievements[id] = true;
      if (window.ui && window.ui.showNotification) {
        var def = ACHIEVEMENT_DEFS[id];
        if (def) {
          window.ui.showNotification('成就解锁：' + def.name, def.desc);
        }
      }
      this.addDepth(5);
    }
  };

  Player.prototype.getAchievements = function () {
    return this._achievements;
  };

  Player.prototype.getAchievementCount = function () {
    var count = 0;
    for (var key in this._achievements) {
      if (this._achievements[key]) count++;
    }
    return count;
  };

  Player.prototype.unlockPortrait = function (portraitId) {
    this._portraitUnlocked[portraitId] = true;
    var count = 0;
    for (var key in this._portraitUnlocked) {
      if (this._portraitUnlocked[key]) count++;
    }
    this.checkAchievement('all_portraits', count >= 5);
  };

  /* ---- Memories ---- */

  Player.prototype.addMemory = function (text, importance) {
    this._memories.push({
      text: text,
      importance: importance || 1,
      timestamp: window.timeSystem ? window.timeSystem.getDisplayTime() : '07:00'
    });
  };

  Player.prototype.getMemories = function () {
    return this._memories.slice();
  };

  Player.prototype.getTopMemories = function (count) {
    var sorted = this._memories.slice().sort(function (a, b) {
      return b.importance - a.importance;
    });
    return sorted.slice(0, count || 5);
  };

  /* ---- Inventory ---- */

  Player.prototype.addItem = function (itemId, name, desc) {
    if (!this.hasItem(itemId)) {
      this._inventory.push({ id: itemId, name: name, desc: desc || '' });
      this.addJournalEntry('获得了：' + name);
    }
  };

  Player.prototype.hasItem = function (itemId) {
    for (var i = 0; i < this._inventory.length; i++) {
      if (this._inventory[i].id === itemId) return true;
    }
    return false;
  };

  Player.prototype.getInventory = function () {
    return this._inventory.slice();
  };

  /* ---- Weather Tracking ---- */

  Player.prototype.recordWeather = function (weatherId) {
    this._weatherSeen[weatherId] = true;
    var count = 0;
    for (var key in this._weatherSeen) {
      if (this._weatherSeen[key]) count++;
    }
    this.checkAchievement('all_weather', count >= 6);
  };

  /* ---- Observation Tracking ---- */

  Player.prototype.recordObservation = function (detailId) {
    this._stats.thingsObserved++;
    this.addDepth(1);
    this.checkAchievement('first_observation', true);
    this.checkAchievement('deep_observer', this._stats.thingsObserved >= 20);
  };

  /* ---- Comprehensive Profile (for reflection) ---- */

  Player.prototype.getProfile = function () {
    return {
      depth: this._depthScore,
      choices: this._choicesMade,
      stats: this._stats,
      mood: this._mood,
      moodLabel: this.getMoodLabel(),
      relationships: this.getAllRelationships(),
      journal: this._journal,
      memories: this._memories,
      achievements: this._achievements,
      inventory: this._inventory,
      locationsVisited: this._locationsVisited,
      flags: this._flags
    };
  };

  /* ---- Play Style Profile ---- */

  Player.prototype.getPlayStyleProfile = function () {
    var cats = this._stats.choicesByCategory;
    var styleMap = {
      kindness: { label: '温柔', weight: 0 },
      help: { label: '助人', weight: 0 },
      observant: { label: '观察', weight: 0 },
      reflective: { label: '沉思', weight: 0 },
      pause: { label: '从容', weight: 0 },
      rushed: { label: '匆忙', weight: 0 },
      conversation: { label: '善谈', weight: 0 },
      honest: { label: '坦诚', weight: 0 },
      brave: { label: '勇敢', weight: 0 },
      avoidant: { label: '回避', weight: 0 }
    };

    for (var cat in cats) {
      if (cats.hasOwnProperty(cat) && styleMap[cat]) {
        styleMap[cat].weight = cats[cat];
      }
    }

    var sorted = [];
    for (var s in styleMap) {
      if (styleMap.hasOwnProperty(s)) {
        sorted.push({ id: s, label: styleMap[s].label, weight: styleMap[s].weight });
      }
    }
    sorted.sort(function (a, b) { return b.weight - a.weight; });

    var dominant = sorted.length > 0 ? sorted[0] : { id: 'neutral', label: '平和', weight: 0 };
    var secondary = sorted.length > 1 && sorted[1].weight > 0 ? sorted[1] : null;

    return {
      dominant: dominant,
      secondary: secondary,
      allStyles: sorted,
      totalChoices: this._choicesMade
    };
  };

  /* ---- Mood Trend ---- */

  Player.prototype.getMoodTrend = function () {
    var journal = this._journal;
    if (journal.length < 2) return 'insufficient_data';

    var recentCount = Math.min(5, journal.length);
    var recent = journal.slice(-recentCount);
    var earlierCount = Math.min(5, journal.length - recentCount);
    if (earlierCount === 0) return 'stable';

    var currentMood = this._mood;
    return currentMood >= 60 ? 'improving' : (currentMood <= 35 ? 'declining' : 'stable');
  };

  /* ---- Inventory Summary ---- */

  Player.prototype.getInventorySummary = function () {
    var items = this._inventory;
    if (items.length === 0) return { count: 0, items: [], hasMeaningful: false };
    var meaningful = [];
    for (var i = 0; i < items.length; i++) {
      meaningful.push({ name: items[i].name, desc: items[i].desc });
    }
    return { count: items.length, items: meaningful, hasMeaningful: items.length > 0 };
  };

  /* ---- Relationship Summary ---- */

  Player.prototype.getRelationshipSummary = function () {
    var result = { close: [], moderate: [], distant: [], total: 0 };
    for (var npcId in this._relationships) {
      if (this._relationships.hasOwnProperty(npcId)) {
        var val = this._relationships[npcId];
        var entry = { id: npcId, label: this._npcLabel(npcId), value: val };
        if (val >= 60) result.close.push(entry);
        else if (val >= 35) result.moderate.push(entry);
        else result.distant.push(entry);
        result.total++;
      }
    }
    result.close.sort(function (a, b) { return b.value - a.value; });
    result.moderate.sort(function (a, b) { return b.value - a.value; });
    return result;
  };

  /* ---- NPC Meeting Check ---- */

  Player.prototype.hasMetNPC = function (npcId) {
    return (this._relationships[npcId] || 0) > 0;
  };

  /* ---- Locations Visited List ---- */

  Player.prototype.getLocationsVisitedList = function () {
    var locLabels = {
      home: '家', street: '街道', bus_stop: '公交站', office: '办公室',
      park: '公园', church: '教堂', night_room: '夜晚的房间'
    };
    var visited = [];
    for (var locId in this._locationsVisited) {
      if (this._locationsVisited.hasOwnProperty(locId) && this._locationsVisited[locId]) {
        visited.push({ id: locId, label: locLabels[locId] || locId });
      }
    }
    return visited;
  };

  /* ---- Achievement Progress ---- */

  Player.prototype.getAchievementProgress = function () {
    var total = 0;
    var unlocked = 0;
    for (var key in ACHIEVEMENT_DEFS) {
      if (ACHIEVEMENT_DEFS.hasOwnProperty(key)) {
        total++;
        if (this._achievements[key]) unlocked++;
      }
    }
    var list = [];
    for (var id in ACHIEVEMENT_DEFS) {
      if (ACHIEVEMENT_DEFS.hasOwnProperty(id)) {
        list.push({
          id: id,
          name: ACHIEVEMENT_DEFS[id].name,
          desc: ACHIEVEMENT_DEFS[id].desc,
          unlocked: !!this._achievements[id]
        });
      }
    }
    return { total: total, unlocked: unlocked, progress: unlocked / total, list: list };
  };

  window.Player = Player;
})();
