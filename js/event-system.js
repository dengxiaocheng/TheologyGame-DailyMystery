/**
 * EventSystem — 事件触发与选择处理
 * 管理事件生命周期：检测、触发、选择、完成
 * 支持事件链、条件触发、关系影响、心情变化、氛围事件
 */
(function () {
  'use strict';

  function EventSystem() {
    this.events = {};
    this.pendingEvents = [];
    this.currentEvent = null;
    this.completedEvents = {};
    this._eventPhase = 'none'; // 'narration', 'choices', 'result', 'none'

    // Extended state
    this._eventHistory = [];
    this._chainQueue = [];
    this._cooldowns = {};
    this._stats = {
      totalTriggered: 0,
      choicesByCategory: {},
      eventsByLocation: {},
      eventsByPeriod: {},
      totalDepthGained: 0
    };
    this._ambientTimer = 0;
    this._ambientInterval = 90;
  }

  /* ---- Initialization ---- */

  EventSystem.prototype.init = function () {
    var data = window.EVENTS_DATA || [];
    this.events = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i] && data[i].id) {
        this.events[data[i].id] = data[i];
      }
    }
  };

  /* ---- Event Detection ---- */

  EventSystem.prototype.checkForEvents = function (locationId, period) {
    // Check chain queue first
    if (this._chainQueue.length > 0) {
      var chainEvt = this._chainQueue.shift();
      if (chainEvt.location === locationId) {
        return chainEvt;
      }
      // Put it back if wrong location
      this._chainQueue.unshift(chainEvt);
    }

    var matches = [];

    for (var key in this.events) {
      if (!this.events.hasOwnProperty(key)) continue;
      var evt = this.events[key];

      // Must match location
      if (evt.location !== locationId) continue;

      // Must match period
      if (Array.isArray(evt.period)) {
        if (evt.period.indexOf(period) === -1) continue;
      } else {
        if (evt.period !== period) continue;
      }

      // Must not already be completed
      if (this.hasCompletedEvent(evt.id)) continue;

      // Must satisfy flag requirement
      if (!this._checkFlagRequirement(evt)) continue;

      // Must satisfy stat requirement
      if (!this._checkStatRequirement(evt)) continue;

      // Must satisfy relationship requirement
      if (!this._checkRelationshipRequirement(evt)) continue;

      // Must satisfy mood requirement
      if (!this._checkMoodRequirement(evt)) continue;

      // Must not be on cooldown
      if (this._isOnCooldown(evt.id)) continue;

      matches.push(evt);
    }

    // Sort by priority descending
    matches.sort(function (a, b) {
      return (b.priority || 0) - (a.priority || 0);
    });

    return matches.length > 0 ? matches[0] : null;
  };

  EventSystem.prototype._checkFlagRequirement = function (evt) {
    if (!evt.requiresFlag) return true;

    // Special check: night_remember requires 2+ help/observe/pause choices
    if (evt.requiresFlag === '__night_remember_check') {
      return this._checkNightRememberCondition();
    }

    return window.player.hasFlag(evt.requiresFlag);
  };

  EventSystem.prototype._checkNightRememberCondition = function () {
    var stats = window.player.getStats();
    var count = stats.peopleHelped + stats.thingsObserved + stats.timesPaused;
    return count >= 2;
  };

  EventSystem.prototype._checkStatRequirement = function (evt) {
    if (!evt.requiresStats) return true;
    var stats = window.player.getStats();
    for (var stat in evt.requiresStats) {
      if (evt.requiresStats.hasOwnProperty(stat)) {
        if ((stats[stat] || 0) < evt.requiresStats[stat]) return false;
      }
    }
    return true;
  };

  EventSystem.prototype._checkRelationshipRequirement = function (evt) {
    if (!evt.requiresRelationship) return true;
    var npcId = evt.requiresRelationship.npc;
    var minVal = evt.requiresRelationship.min || 0;
    return window.player.getRelationship(npcId) >= minVal;
  };

  EventSystem.prototype._checkMoodRequirement = function (evt) {
    if (!evt.requiresMood) return true;
    var mood = window.player.getMood();
    if (evt.requiresMood.min && mood < evt.requiresMood.min) return false;
    if (evt.requiresMood.max && mood > evt.requiresMood.max) return false;
    return true;
  };

  EventSystem.prototype._isOnCooldown = function (eventId) {
    return this._cooldowns[eventId] && this._cooldowns[eventId] > 0;
  };

  /* ---- Event Triggering ---- */

  EventSystem.prototype.triggerEvent = function (event) {
    this.currentEvent = event;
    this._eventPhase = 'narration';
    window.timeSystem.pause();
    window.ui.hideExits();

    // Show narration first
    window.ui.showNarration(event.narration);

    // Track stats
    this._stats.totalTriggered++;
    var locKey = event.location || 'unknown';
    if (!this._stats.eventsByLocation[locKey]) this._stats.eventsByLocation[locKey] = 0;
    this._stats.eventsByLocation[locKey]++;
    var periodKey = Array.isArray(event.period) ? event.period[0] : (event.period || 'unknown');
    if (!this._stats.eventsByPeriod[periodKey]) this._stats.eventsByPeriod[periodKey] = 0;
    this._stats.eventsByPeriod[periodKey]++;
  };

  /**
   * Called when player presses Space/Enter during event narration phase.
   * Transitions from narration to choices.
   */
  EventSystem.prototype.showEventChoices = function () {
    if (!this.currentEvent || this._eventPhase !== 'narration') return;

    this._eventPhase = 'choices';
    window.ui.hideNarration();

    var self = this;
    window.ui.showChoices(this.currentEvent.choices, function (choiceId) {
      self.handleChoice(choiceId);
    });
  };

  /* ---- Choice Handling ---- */

  EventSystem.prototype.handleChoice = function (choiceId) {
    if (!this.currentEvent) return;

    // Find the chosen option
    var choice = null;
    var choices = this.currentEvent.choices;
    for (var i = 0; i < choices.length; i++) {
      if (choices[i].id === choiceId) {
        choice = choices[i];
        break;
      }
    }
    if (!choice) return;

    // 1. Record choice
    window.player.recordChoice(choiceId, choice.category);

    // 2. Add depth
    var depthChange = choice.depthChange || 0;
    window.player.addDepth(depthChange);
    this._stats.totalDepthGained += Math.max(0, depthChange);

    // 3. Set flag if specified
    if (choice.flag) {
      window.player.setFlag(this.currentEvent.id + '_' + choice.flag);
    }

    // 4. Advance time
    if (choice.timeCost > 0) {
      window.timeSystem.addMinutes(choice.timeCost);
    }

    // 5. Apply relationship effects
    if (choice.relationshipDelta) {
      for (var npcId in choice.relationshipDelta) {
        if (choice.relationshipDelta.hasOwnProperty(npcId)) {
          window.player.updateRelationship(npcId, choice.relationshipDelta[npcId]);
        }
      }
    }

    // 6. Apply mood effects from choice
    if (choice.moodDelta) {
      window.player.adjustMood(choice.moodDelta);
    }

    // 7. Add inventory items
    if (choice.giveItem) {
      window.player.addItem(choice.giveItem.id, choice.giveItem.name, choice.giveItem.desc);
    }

    // 8. Add journal entry
    if (choice.journalEntry) {
      window.player.addJournalEntry(choice.journalEntry);
    }

    // 9. Add memory
    if (choice.memory) {
      window.player.addMemory(choice.memory, choice.memoryImportance || 2);
    }

    // 10. Increment relevant stats based on category
    if (choice.category === 'kindness' || choice.category === 'help') {
      window.player.incrementStat('peopleHelped');
    }
    if (choice.category === 'observant') {
      window.player.incrementStat('thingsObserved');
    }
    if (choice.category === 'reflective' || choice.category === 'pause') {
      window.player.incrementStat('timesPaused');
    }
    if (choice.category === 'rushed') {
      window.player.incrementStat('timesRushed');
    }
    if (choice.category === 'conversation' || choice.category === 'honest') {
      window.player.incrementStat('conversationsHad');
    }

    // 11. Track choice category in event stats
    if (choice.category) {
      if (!this._stats.choicesByCategory[choice.category]) {
        this._stats.choicesByCategory[choice.category] = 0;
      }
      this._stats.choicesByCategory[choice.category]++;
    }

    // 12. Queue chain event if specified
    if (choice.chainEvent) {
      this._queueChainEvent(choice.chainEvent);
    }

    // 13. Set cooldown if event specifies one
    if (this.currentEvent.cooldown) {
      this._cooldowns[this.currentEvent.id] = this.currentEvent.cooldown;
    }

    // 14. Record in event history
    this._eventHistory.push({
      id: this.currentEvent.id,
      choiceId: choiceId,
      category: choice.category,
      depthChange: depthChange,
      location: this.currentEvent.location,
      period: Array.isArray(this.currentEvent.period) ? this.currentEvent.period[0] : this.currentEvent.period,
      timestamp: window.timeSystem ? window.timeSystem.getDisplayTime() : '??:??'
    });

    // 15. Hide choices, show result
    this._eventPhase = 'result';
    window.ui.hideChoices();
    window.ui.showNarration(choice.result);

    // 16. Mark event as completed
    this.completeEvent();
  };

  /**
   * Called when player presses Space/Enter during result phase.
   * Returns to playing state.
   */
  EventSystem.prototype.dismissResult = function () {
    if (this._eventPhase !== 'result') return;

    this._eventPhase = 'none';
    this.currentEvent = null;
    window.ui.hideNarration();
    window.timeSystem.resume();

    // Check if time period changed due to timeCost
    var newPeriod = window.timeSystem.getPeriod();
    var locId = window.player.getLocation();
    var loc = window.gameMap.locations[locId];

    // If current location is no longer accessible, try to redirect
    if (loc && loc.periods.indexOf(newPeriod) === -1) {
      // Redirect to street (hub) or night_room if it's night
      if (newPeriod === 'night') {
        window.player.setLocation('night_room');
      } else {
        window.player.setLocation('street');
      }
    }

    // Show exits for (possibly new) location
    var currentLoc = window.gameMap.getCurrentLocation();
    if (currentLoc) {
      window.ui.showNarration(currentLoc.name);
      var self = this;
      setTimeout(function () {
        window.ui.hideNarration();
        // Check for chain event first
        var nextEvent = null;
        if (self._chainQueue.length > 0) {
          nextEvent = self._chainQueue.shift();
        }
        if (!nextEvent) {
          nextEvent = window.eventSystem.checkForEvents(
            window.player.getLocation(),
            window.timeSystem.getPeriod()
          );
        }
        if (nextEvent) {
          setTimeout(function () {
            window.eventSystem.triggerEvent(nextEvent);
            if (window._setGameState) window._setGameState('event');
          }, 500);
        } else {
          var exits = window.gameMap.getAvailableExits();
          if (exits.length > 0) {
            window.ui.showExits(exits);
          }
        }
      }, 800);
    }
  };

  /* ---- Chain Events ---- */

  EventSystem.prototype._queueChainEvent = function (chainData) {
    var chainEvt = null;
    if (typeof chainData === 'string') {
      chainEvt = this.events[chainData] || null;
    } else if (typeof chainData === 'object') {
      chainEvt = chainData;
    }
    if (chainEvt) {
      if (!chainEvt.location && this.currentEvent) {
        chainEvt.location = this.currentEvent.location;
      }
      this._chainQueue.push(chainEvt);
    }
  };

  EventSystem.prototype.getChainQueue = function () {
    return this._chainQueue.slice();
  };

  EventSystem.prototype.hasPendingChains = function () {
    return this._chainQueue.length > 0;
  };

  EventSystem.prototype.clearChainQueue = function () {
    this._chainQueue = [];
  };

  /* ---- Cooldown Management ---- */

  EventSystem.prototype.updateCooldowns = function (minutes) {
    for (var id in this._cooldowns) {
      if (this._cooldowns.hasOwnProperty(id)) {
        this._cooldowns[id] -= minutes;
        if (this._cooldowns[id] <= 0) {
          delete this._cooldowns[id];
        }
      }
    }
  };

  EventSystem.prototype.getCooldowns = function () {
    var result = {};
    for (var id in this._cooldowns) {
      if (this._cooldowns.hasOwnProperty(id)) {
        result[id] = this._cooldowns[id];
      }
    }
    return result;
  };

  /* ---- Ambient Events ---- */

  EventSystem.prototype.checkAmbientEvent = function (locationId, period) {
    this._ambientTimer += 1;
    if (this._ambientTimer < this._ambientInterval) return null;
    this._ambientTimer = 0;

    if (Math.random() > 0.3) return null;
    return this._generateAmbientEvent(locationId, period);
  };

  EventSystem.prototype._generateAmbientEvent = function (locId, period) {
    var ambientPool = {
      home: {
        morning: [
          '你听见隔壁传来起床的动静。楼板在脚下轻轻震动。',
          '水龙头滴了一滴水。然后又一滴。像是某种倒计时。',
          '冰箱的嗡嗡声突然停了。厨房安静得不像话。'
        ],
        night: [
          '远处有火车经过的鸣笛声。像是来自另一个世界的问候。',
          '楼上有人在走动。拖鞋擦过地板的声音，在夜里格外清晰。'
        ]
      },
      street: {
        morning: [
          '一辆自行车从身边掠过，带起一阵微风。',
          '路边的树上有鸟在叫。它们从来不赶时间。'
        ],
        commute: [
          '有人在路边等出租车，神情焦急。',
          '一个孩子拉着大人的手，指着一朵云笑了。'
        ],
        'commute-home': [
          '路灯一盏一盏地亮了起来。',
          '一只狗从巷子里跑出来，又跑回去了。'
        ],
        evening: [
          '远处传来音乐声，有人在练习小提琴。',
          '面包店飘出刚出炉的香气。虽然已经关了门。'
        ]
      },
      bus_stop: {
        commute: [
          '公交车猛地刹车，所有人都往前倾了一下。',
          '窗外一闪而过的广告牌上写着："慢下来。"'
        ],
        'commute-home': [
          '车窗外的夕阳把所有东西都染成了橙色。',
          '后座有人在小声哼歌。你听不出是什么曲子。'
        ]
      },
      office: {
        work: [
          '打印机突然开始运转，吐出一张白纸。',
          '某个角落传来压低声音的电话。有人在说"我知道了"。'
        ],
        lunch: [
          '走廊里有笑声。不知道谁在讲笑话。',
          '微波炉嗡嗡转着。有人站在旁边等，表情空洞。'
        ],
        afternoon: [
          '窗外有鸟飞过。在玻璃的倒影里，它们像是飞进了办公室。',
          '时钟的秒针走得很慢。你盯着它看了很久。'
        ]
      },
      park: {
        lunch: [
          '一只松鼠从树枝上跳下来，看了你一眼，又跳回去了。',
          '远处有人在练太极。动作很慢，像是在和空气对话。'
        ],
        afternoon: [
          '喷泉的水花在阳光下变成彩虹。',
          '一个小女孩在追蝴蝶。蝴蝶飞得很慢，但还是追不上。'
        ],
        evening: [
          '长椅上留下一张报纸。风翻动着它的页面。',
          '路灯亮了。公园的影子变得又长又淡。'
        ]
      },
      church: {
        afternoon: [
          '风铃响了。但这里没有风铃。',
          '鸽子落在台阶上，歪着头看你。'
        ],
        evening: [
          '教堂的钟响了一下。只响了一下。',
          '彩窗在暮色中变暗。红色最后消失。'
        ]
      },
      night_room: {
        night: [
          '水管里传来咕噜声。整栋楼在呼吸。',
          '你听见自己的心跳。在夜里它听起来格外响。'
        ]
      }
    };

    var locPool = ambientPool[locId];
    if (!locPool) return null;
    var texts = locPool[period];
    if (!texts || texts.length === 0) return null;

    var text = texts[Math.floor(Math.random() * texts.length)];

    return {
      id: 'ambient_' + locId + '_' + period,
      location: locId,
      narration: text,
      ambient: true,
      priority: 1,
      choices: [
        { id: 'notice', text: '注意到了。', depthChange: 1, category: 'observant', result: '这个瞬间被你收入了记忆。' },
        { id: 'ignore', text: '……', depthChange: 0, category: 'rushed', result: '你继续走你的路。' }
      ]
    };
  };

  /* ---- State Queries ---- */

  EventSystem.prototype.completeEvent = function () {
    if (this.currentEvent) {
      this.completedEvents[this.currentEvent.id] = true;
    }
  };

  EventSystem.prototype.isEventActive = function () {
    return !!this.currentEvent;
  };

  EventSystem.prototype.getEventPhase = function () {
    return this._eventPhase;
  };

  EventSystem.prototype.hasCompletedEvent = function (id) {
    return !!this.completedEvents[id];
  };

  /* ---- History & Statistics ---- */

  EventSystem.prototype.getEventHistory = function () {
    return this._eventHistory.slice();
  };

  EventSystem.prototype.getEventCount = function () {
    return this._eventHistory.length;
  };

  EventSystem.prototype.getStats = function () {
    return this._stats;
  };

  EventSystem.prototype.getChoiceCountByCategory = function (category) {
    return this._stats.choicesByCategory[category] || 0;
  };

  EventSystem.prototype.getLastEvent = function () {
    return this._eventHistory.length > 0
      ? this._eventHistory[this._eventHistory.length - 1]
      : null;
  };

  EventSystem.prototype.getEventsByLocation = function (locId) {
    return this._eventHistory.filter(function (h) {
      return h.location === locId;
    });
  };

  EventSystem.prototype.getEventsByPeriod = function (periodId) {
    return this._eventHistory.filter(function (h) {
      return h.period === periodId;
    });
  };

  EventSystem.prototype.getDominantPlayStyle = function () {
    var cats = this._stats.choicesByCategory;
    var maxCat = 'neutral';
    var maxCount = 0;
    for (var cat in cats) {
      if (cats.hasOwnProperty(cat) && cats[cat] > maxCount) {
        maxCount = cats[cat];
        maxCat = cat;
      }
    }
    return maxCat;
  };

  EventSystem.prototype.getCompletedEventIds = function () {
    var ids = [];
    for (var id in this.completedEvents) {
      if (this.completedEvents.hasOwnProperty(id)) {
        ids.push(id);
      }
    }
    return ids;
  };

  EventSystem.prototype.getCompletedEventCount = function () {
    var count = 0;
    for (var id in this.completedEvents) {
      if (this.completedEvents.hasOwnProperty(id)) count++;
    }
    return count;
  };

  /* ---- Analysis Methods ---- */

  EventSystem.prototype.getLocationSummary = function () {
    var locLabels = {
      home: '家', street: '街道', bus_stop: '公交站', office: '办公室',
      park: '公园', church: '教堂', night_room: '夜晚的房间'
    };
    var summary = [];
    for (var locId in this._stats.eventsByLocation) {
      if (this._stats.eventsByLocation.hasOwnProperty(locId)) {
        summary.push({
          id: locId,
          label: locLabels[locId] || locId,
          count: this._stats.eventsByLocation[locId]
        });
      }
    }
    summary.sort(function (a, b) { return b.count - a.count; });
    return summary;
  };

  EventSystem.prototype.getChoicePattern = function () {
    var catLabels = {
      kindness: '善意', help: '帮助', observant: '观察', reflective: '沉思',
      pause: '驻足', rushed: '匆忙', conversation: '交谈', honest: '坦诚',
      brave: '勇敢', avoidant: '回避', neutral: '中立'
    };
    var total = 0;
    var cats = this._stats.choicesByCategory;
    for (var c in cats) {
      if (cats.hasOwnProperty(c)) total += cats[c];
    }
    if (total === 0) return { dominant: 'neutral', breakdown: [], total: 0 };

    var breakdown = [];
    for (var cat in cats) {
      if (cats.hasOwnProperty(cat)) {
        breakdown.push({
          id: cat,
          label: catLabels[cat] || cat,
          count: cats[cat],
          ratio: cats[cat] / total
        });
      }
    }
    breakdown.sort(function (a, b) { return b.count - a.count; });

    var dominantStyle = this.getDominantPlayStyle();
    return {
      dominant: dominantStyle,
      dominantLabel: catLabels[dominantStyle] || dominantStyle,
      breakdown: breakdown,
      total: total
    };
  };

  EventSystem.prototype.getNarrativeArc = function () {
    if (this._eventHistory.length === 0) {
      return { phases: [], arcType: 'empty' };
    }

    var phases = [];
    var segmentSize = Math.max(1, Math.floor(this._eventHistory.length / 3));
    var segmentNames = ['beginning', 'middle', 'end'];
    var segmentLabels = { beginning: '开始', middle: '中段', end: '结尾' };

    for (var s = 0; s < 3; s++) {
      var start = s * segmentSize;
      var end = (s === 2) ? this._eventHistory.length : (s + 1) * segmentSize;
      var segCats = {};
      var segDepth = 0;
      for (var i = start; i < end; i++) {
        var cat = this._eventHistory[i].category || 'neutral';
        segCats[cat] = (segCats[cat] || 0) + 1;
        segDepth += (this._eventHistory[i].depthChange || 0);
      }
      var topCat = 'neutral';
      var topCount = 0;
      for (var sc in segCats) {
        if (segCats.hasOwnProperty(sc) && segCats[sc] > topCount) {
          topCount = segCats[sc];
          topCat = sc;
        }
      }
      phases.push({
        name: segmentNames[s],
        label: segmentLabels[segmentNames[s]],
        topCategory: topCat,
        avgDepth: end > start ? (segDepth / (end - start)) : 0,
        eventCount: end - start
      });
    }

    var arcType = 'steady';
    var firstDepth = phases[0].avgDepth;
    var lastDepth = phases[2].avgDepth;
    if (lastDepth > firstDepth + 1) arcType = 'ascending';
    else if (lastDepth < firstDepth - 1) arcType = 'descending';
    else if (firstDepth > 2) arcType = 'deep';

    return { phases: phases, arcType: arcType };
  };

  EventSystem.prototype.getTimeSpentInEvents = function () {
    var totalMinutes = 0;
    var byLocation = {};
    for (var i = 0; i < this._eventHistory.length; i++) {
      var evt = this._eventHistory[i];
      var evtObj = this.events[evt.id];
      if (!evtObj) continue;
      for (var j = 0; j < evtObj.choices.length; j++) {
        if (evtObj.choices[j].id === evt.choiceId) {
          var cost = evtObj.choices[j].timeCost || 0;
          totalMinutes += cost;
          var loc = evt.location || 'unknown';
          byLocation[loc] = (byLocation[loc] || 0) + cost;
          break;
        }
      }
    }
    return { totalMinutes: totalMinutes, byLocation: byLocation };
  };

  EventSystem.prototype.getDepthBreakdown = function () {
    var byCategory = {};
    var total = 0;
    for (var i = 0; i < this._eventHistory.length; i++) {
      var h = this._eventHistory[i];
      var dc = h.depthChange || 0;
      if (dc > 0) {
        var cat = h.category || 'neutral';
        byCategory[cat] = (byCategory[cat] || 0) + dc;
        total += dc;
      }
    }
    return { total: total, byCategory: byCategory };
  };

  EventSystem.prototype.getRelationshipImpactSummary = function () {
    var impacts = {};
    for (var i = 0; i < this._eventHistory.length; i++) {
      var evt = this._eventHistory[i];
      var evtObj = this.events[evt.id];
      if (!evtObj) continue;
      for (var j = 0; j < evtObj.choices.length; j++) {
        if (evtObj.choices[j].id === evt.choiceId && evtObj.choices[j].relationshipDelta) {
          var deltas = evtObj.choices[j].relationshipDelta;
          for (var npcId in deltas) {
            if (deltas.hasOwnProperty(npcId)) {
              if (!impacts[npcId]) impacts[npcId] = { totalDelta: 0, interactions: 0 };
              impacts[npcId].totalDelta += deltas[npcId];
              impacts[npcId].interactions++;
            }
          }
        }
      }
    }
    return impacts;
  };

  EventSystem.prototype.exportSummary = function () {
    return {
      totalEvents: this._eventHistory.length,
      completedIds: this.getCompletedEventIds(),
      stats: this._stats,
      choicePattern: this.getChoicePattern(),
      narrativeArc: this.getNarrativeArc(),
      depthBreakdown: this.getDepthBreakdown(),
      locationSummary: this.getLocationSummary(),
      timeSpent: this.getTimeSpentInEvents(),
      relationshipImpacts: this.getRelationshipImpactSummary(),
      chainQueueLength: this._chainQueue.length,
      ambientTimer: this._ambientTimer
    };
  };

  /* ---- Reset ---- */

  EventSystem.prototype.reset = function () {
    this.currentEvent = null;
    this.completedEvents = {};
    this._eventPhase = 'none';
    this._eventHistory = [];
    this._chainQueue = [];
    this._cooldowns = {};
    this._stats = {
      totalTriggered: 0,
      choicesByCategory: {},
      eventsByLocation: {},
      eventsByPeriod: {},
      totalDepthGained: 0
    };
    this._ambientTimer = 0;
  };

  window.EventSystem = EventSystem;
})();
