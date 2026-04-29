/**
 * ReflectionSystem — 灵性画像系统
 * 一天结束时，根据玩家行为生成画像和总结
 * 扩展：更丰富的日终回顾、心情影响色彩、日志高亮、成就展示、时间线可视化
 */
(function () {
  'use strict';

  /* ---- Portrait Definitions ---- */

  var portraits = [
    {
      id: 'companion',
      name: '同行者',
      subtitle: '你选择了与一个人走一段路',
      description: '你停下脚步，看向身边的人。不是因为他们需要你，而是因为你知道——人不应独行。你的今天给了某个人一段不孤独的时间。',
      color: '#b898d8',
      condition: function (stats) {
        return stats.peopleHelped >= 3;
      }
    },
    {
      id: 'actor',
      name: '行动者',
      subtitle: '你伸出了手',
      description: '当别人走开时，你留了下来。当别人沉默时，你开了口。不是因为勇敢，而是因为你觉得——如果不做，什么都不会改变。',
      color: '#d8a878',
      condition: function (stats) {
        return (stats.peopleHelped + stats.conversationsHad) >= 4;
      }
    },
    {
      id: 'thinker',
      name: '守望者',
      subtitle: '你看见了别人没看见的',
      description: '你走得不快，但你看得很深。这个世界在匆忙中遗漏的细节，被你一一拾起。你不是旁观者——你是见证人。',
      color: '#88b8d8',
      condition: function (stats) {
        return (stats.thingsObserved + stats.timesPaused) >= 4;
      }
    },
    {
      id: 'bystander',
      name: '路过者',
      subtitle: '你经过了这一切',
      description: '你走过了今天。有些东西你看到了，有些你没有。这不代表你不在乎——也许只是还没准备好停下来。明天，也许会不一样。',
      color: '#a0a0a0',
      condition: function (stats) {
        return stats.timesRushed >= 3;
      }
    },
    {
      id: 'rusher',
      name: '匆忙的人',
      subtitle: '时间推着你走',
      description: '你一直在赶路。也许在追赶什么，也许在逃离什么。今天没有对错——只有你走过的路，和你没来得及看的风景。停下来，不晚。',
      color: '#d87878',
      condition: function () {
        return true; // default fallback
      }
    }
  ];

  /* ---- Additional Portrait Definitions ---- */

  var extraPortraits = [
    {
      id: 'wanderer',
      name: '漫游者',
      subtitle: '你的脚步遍及各处',
      description: '你没有在同一个地方停留太久。每一条街道、每一个角落，都留下了你的影子。你不是在逃避——你只是想看更多。',
      color: '#78c8a8',
      condition: function (stats) {
        return stats.locationsVisited >= 5;
      }
    },
    {
      id: 'mirror',
      name: '镜子',
      subtitle: '你看见了真实的自己',
      description: '你对自己坦诚。不美化，不回避。在所有选择的背后，你看见了自己的影子。不是完美——但真实。',
      color: '#c8b898',
      condition: function (stats) {
        var cats = stats.choicesByCategory || {};
        var diverse = 0;
        for (var k in cats) {
          if (cats.hasOwnProperty(k) && cats[k] > 0) diverse++;
        }
        return diverse >= 4;
      }
    }
  ];

  /* ---- Mood Color Palettes ---- */

  var moodPalettes = {
    heavy:    { bg1: '#0a0308', bg2: '#120810', bg3: '#080308', particle: '#808090' },
    low:      { bg1: '#0a0510', bg2: '#120a18', bg3: '#080510', particle: '#9090a0' },
    neutral:  { bg1: '#0a0515', bg2: '#120a20', bg3: '#080510', particle: '#b0b0b0' },
    elevated: { bg1: '#0a0815', bg2: '#140e22', bg3: '#0a0612', particle: '#c0c0a0' },
    bright:   { bg1: '#0a0a18', bg2: '#161025', bg3: '#0c0815', particle: '#d0c890' }
  };

  /* ---- Timeline Period Labels ---- */

  var periodLabels = {
    morning: '清晨',
    commute: '通勤',
    work: '工作',
    lunch: '午餐',
    afternoon: '午后',
    'commute-home': '归途',
    evening: '傍晚',
    night: '深夜'
  };

  var periodIcons = {
    morning: '○',
    commute: '→',
    work: '□',
    lunch: '△',
    afternoon: '△',
    'commute-home': '←',
    evening: '◑',
    night: '●'
  };

  /* ---- Constructor ---- */

  function ReflectionSystem() {
    this._portrait = null;
    this._animTime = 0;
    this._particles = [];
    this._starField = [];
    this._floatingTexts = [];
    this._timelineData = [];
    this._initialized = false;
  }

  /* ---- Portrait Calculation ---- */

  ReflectionSystem.prototype.calculatePortrait = function () {
    var stats = window.player.getStats();

    // Check extra portraits first (higher priority)
    for (var e = 0; e < extraPortraits.length; e++) {
      if (extraPortraits[e].condition(stats)) {
        this._portrait = extraPortraits[e];
        window.player.unlockPortrait(extraPortraits[e].id);
        return this._portrait;
      }
    }

    for (var i = 0; i < portraits.length; i++) {
      if (portraits[i].condition(stats)) {
        this._portrait = portraits[i];
        window.player.unlockPortrait(portraits[i].id);
        return this._portrait;
      }
    }
    // Fallback to last (rusher)
    this._portrait = portraits[portraits.length - 1];
    return this._portrait;
  };

  /* ---- Generate Reflection HTML ---- */

  ReflectionSystem.prototype.generateReflection = function () {
    var p = this.calculatePortrait();
    var stats = window.player.getStats();
    var profile = window.player.getProfile();

    // Build day review
    var reviewLines = [];
    if (stats.peopleHelped > 0) {
      reviewLines.push('<div class="stat-row"><span>你帮助了别人</span><span>' + stats.peopleHelped + ' 次</span></div>');
    }
    if (stats.conversationsHad > 0) {
      reviewLines.push('<div class="stat-row"><span>你与人交谈</span><span>' + stats.conversationsHad + ' 次</span></div>');
    }
    if (stats.timesPaused > 0) {
      reviewLines.push('<div class="stat-row"><span>你停下来感受</span><span>' + stats.timesPaused + ' 次</span></div>');
    }
    if (stats.thingsObserved > 0) {
      reviewLines.push('<div class="stat-row"><span>你观察了世界</span><span>' + stats.thingsObserved + ' 次</span></div>');
    }
    if (stats.timesRushed > 0) {
      reviewLines.push('<div class="stat-row"><span>你匆匆忙忙</span><span>' + stats.timesRushed + ' 次</span></div>');
    }

    var reviewHtml = reviewLines.length > 0
      ? '<div class="portrait-section-title">这一天</div>' + reviewLines.join('')
      : '';

    // Journal highlights
    var journal = profile.journal || [];
    var journalHtml = '';
    if (journal.length > 0) {
      var journalEntries = journal.slice(-5);
      var journalLines = [];
      for (var j = 0; j < journalEntries.length; j++) {
        journalLines.push('<div class="journal-entry"><span class="journal-time">' +
          journalEntries[j].time + '</span>' + journalEntries[j].text + '</div>');
      }
      journalHtml = '<div class="portrait-section-title">日志</div>' +
        '<div class="journal-highlights">' + journalLines.join('') + '</div>';
    }

    // Memory highlights
    var memories = profile.memories || [];
    var memoryHtml = '';
    if (memories.length > 0) {
      var topMemories = window.player.getTopMemories(3);
      var memLines = [];
      for (var m = 0; m < topMemories.length; m++) {
        memLines.push('<div class="memory-item">' + topMemories[m].text + '</div>');
      }
      memoryHtml = '<div class="portrait-section-title">记忆</div>' +
        '<div class="memory-highlights">' + memLines.join('') + '</div>';
    }

    // Achievements
    var achievements = profile.achievements || {};
    var achHtml = '';
    var achCount = 0;
    for (var aKey in achievements) {
      if (achievements.hasOwnProperty(aKey) && achievements[aKey]) achCount++;
    }
    if (achCount > 0) {
      achHtml = '<div class="portrait-section-title">成就</div>' +
        '<div class="stat-row"><span>已解锁</span><span>' + achCount + ' 个</span></div>';
    }

    // Relationships summary
    var relHtml = '';
    var rels = profile.relationships || {};
    var relLines = [];
    for (var rId in rels) {
      if (rels.hasOwnProperty(rId)) {
        var relVal = rels[rId];
        var relBar = '';
        var barLen = Math.round(relVal / 10);
        for (var b = 0; b < 10; b++) {
          relBar += b < barLen ? '■' : '□';
        }
        var npcName = this._npcLabel(rId);
        if (relVal !== 50 && relVal !== 30 && relVal !== 20 && relVal !== 40 &&
            relVal !== 35 && relVal !== 45 && relVal !== 15 && relVal !== 10 &&
            relVal !== 25) {
          // Only show changed relationships
        }
        relLines.push('<div class="stat-row"><span>' + npcName + '</span><span class="rel-bar">' + relBar + '</span></div>');
      }
    }
    if (relLines.length > 0) {
      relHtml = '<div class="portrait-section-title">人际</div>' + relLines.join('');
    }

    // Timeline
    var timelineHtml = this._generateTimelineHtml();

    // Mood
    var moodHtml = '<div class="portrait-section-title">心情</div>' +
      '<div class="stat-row"><span>' + profile.moodLabel + '</span><span>' + profile.mood + '/100</span></div>';

    // Inventory
    var inv = profile.inventory || [];
    var invHtml = '';
    if (inv.length > 0) {
      var invLines = [];
      for (var iv = 0; iv < inv.length; iv++) {
        invLines.push('<div class="inv-item">' + inv[iv].name + '</div>');
      }
      invHtml = '<div class="portrait-section-title">物品</div>' +
        '<div class="inventory-summary">' + invLines.join('') + '</div>';
    }

    // Depth score — FIXED: use getDepth() instead of direct property access
    var depthHtml = '<div class="portrait-section-title">深度</div>' +
      '<div class="stat-row"><span>深度分数</span><span>' + window.player.getDepth() + '</span></div>';

    var html = '<div class="portrait-title" style="color:' + p.color + '">' + p.name + '</div>' +
      '<div class="portrait-subtitle">' + p.subtitle + '</div>' +
      '<div class="portrait-body">' +
      '<div class="portrait-description">' + p.description + '</div>' +
      reviewHtml +
      timelineHtml +
      moodHtml +
      depthHtml +
      journalHtml +
      memoryHtml +
      relHtml +
      achHtml +
      invHtml +
      '</div>' +
      '<p class="portrait-ending">夜深了。<br>轻触屏幕重新开始。</p>';

    return html;
  };

  /* ---- Timeline HTML ---- */

  ReflectionSystem.prototype._generateTimelineHtml = function () {
    var eventHistory = window.eventSystem ? window.eventSystem.getEventHistory() : [];
    if (eventHistory.length === 0) return '';

    var html = '<div class="portrait-section-title">时间线</div>';
    html += '<div class="timeline-container">';

    for (var i = 0; i < eventHistory.length; i++) {
      var evt = eventHistory[i];
      var periodLabel = periodLabels[evt.period] || evt.period;
      var icon = periodIcons[evt.period] || '·';
      html += '<div class="timeline-entry">' +
        '<span class="timeline-icon">' + icon + '</span>' +
        '<span class="timeline-time">' + evt.timestamp + '</span>' +
        '<span class="timeline-location">' + (this._locationLabel(evt.location)) + '</span>' +
        '</div>';
    }

    html += '</div>';
    return html;
  };

  ReflectionSystem.prototype._locationLabel = function (locId) {
    var labels = {
      home: '家', street: '街道', bus_stop: '公交站',
      office: '办公室', park: '公园', church: '教堂', night_room: '夜室'
    };
    return labels[locId] || locId;
  };

  ReflectionSystem.prototype._npcLabel = function (id) {
    var labels = {
      mother: '母亲', elderly_bus: '公交上的老人', silent_woman: '沉默的女人',
      colleague_li: '同事李', colleague_wang: '同事王', lunch_friend: '午餐朋友',
      beggar: '街边的乞丐', park_stranger: '公园的陌生人', neighbor_auntie: '邻居阿姨',
      boss: '老板', barista: '咖啡师', street_cat: '街猫'
    };
    return labels[id] || id;
  };

  /* ---- Render Reflection Scene (Canvas) ---- */

  ReflectionSystem.prototype.renderScene = function (ctx, w, h, dt) {
    this._animTime += dt;

    // Initialize star field
    if (this._starField.length === 0) {
      for (var s = 0; s < 80; s++) {
        this._starField.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.5,
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.5 + 0.2
        });
      }
    }

    // Initialize particles
    if (this._particles.length === 0) {
      for (var i = 0; i < 50; i++) {
        this._particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 20 - 5,
          size: Math.random() * 3 + 1,
          alpha: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // Initialize floating text (memories)
    if (this._floatingTexts.length === 0) {
      var memories = window.player ? window.player.getTopMemories(4) : [];
      for (var m = 0; m < memories.length; m++) {
        this._floatingTexts.push({
          text: memories[m].text,
          x: Math.random() * w * 0.6 + w * 0.2,
          y: h * 0.5 + Math.random() * h * 0.3,
          alpha: 0,
          fadeIn: true,
          delay: m * 2,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    // Get mood palette
    var moodLabel = window.player ? window.player.getMoodLabel() : 'neutral';
    var palette = moodPalettes[moodLabel] || moodPalettes.neutral;

    var p = this._portrait || portraits[portraits.length - 1];

    // Dark gradient background with mood influence
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, palette.bg1);
    grad.addColorStop(0.5, palette.bg2);
    grad.addColorStop(1, palette.bg3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Render star field
    this._renderStars(ctx, w, h);

    // Central glow (portrait color)
    var pulse = Math.sin(this._animTime * 0.8) * 0.1 + 0.9;
    var glowR = Math.min(w, h) * 0.35 * pulse;
    var cx = w / 2;
    var cy = h * 0.3;

    // Outer glow ring
    var outerGlow = ctx.createRadialGradient(cx, cy, glowR * 0.8, cx, cy, glowR * 1.3);
    outerGlow.addColorStop(0, this._hexToRgba(p.color, 0.06));
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Main glow
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    glow.addColorStop(0, this._hexToRgba(p.color, 0.25));
    glow.addColorStop(0.5, this._hexToRgba(p.color, 0.08));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright core
    var coreR = glowR * 0.15 * pulse;
    var coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
    coreGrad.addColorStop(0, this._hexToRgba(p.color, 0.6));
    coreGrad.addColorStop(1, this._hexToRgba(p.color, 0));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
    ctx.fill();

    // Portrait icon (abstract silhouette)
    this._renderPortraitIcon(ctx, cx, cy, p, pulse);

    // Render horizon line
    this._renderHorizon(ctx, w, h, p);

    // Floating particles
    for (var i = 0; i < this._particles.length; i++) {
      var pt = this._particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;

      // Wrap around
      if (pt.y < -10) { pt.y = h + 10; pt.x = Math.random() * w; }
      if (pt.x < -10) pt.x = w + 10;
      if (pt.x > w + 10) pt.x = -10;

      ctx.save();
      var ptAlpha = pt.alpha * (0.5 + 0.5 * Math.sin(this._animTime * pt.speed + pt.phase));
      ctx.globalAlpha = Math.max(0, ptAlpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render floating memory texts
    this._renderFloatingTexts(ctx, w, h, dt);

    // Render depth ring at bottom
    this._renderDepthRing(ctx, w, h, p);

    // Vignette effect
    this._renderVignette(ctx, w, h);
  };

  /* ---- Star Field ---- */

  ReflectionSystem.prototype._renderStars = function (ctx, w, h) {
    for (var i = 0; i < this._starField.length; i++) {
      var star = this._starField[i];
      star.twinkle += star.speed * 0.02;
      var alpha = 0.3 + 0.4 * Math.sin(star.twinkle);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  /* ---- Horizon Line ---- */

  ReflectionSystem.prototype._renderHorizon = function (ctx, w, h, portrait) {
    var horizonY = h * 0.65;

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = portrait.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);

    // Wavy horizon
    for (var x = 0; x <= w; x += 4) {
      var wave = Math.sin(x * 0.01 + this._animTime * 0.3) * 3 +
                 Math.sin(x * 0.025 + this._animTime * 0.15) * 2;
      ctx.lineTo(x, horizonY + wave);
    }
    ctx.stroke();

    // Subtle glow below horizon
    var hGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    hGrad.addColorStop(0, this._hexToRgba(portrait.color, 0.03));
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    ctx.restore();
  };

  /* ---- Floating Memory Texts ---- */

  ReflectionSystem.prototype._renderFloatingTexts = function (ctx, w, h, dt) {
    for (var i = 0; i < this._floatingTexts.length; i++) {
      var ft = this._floatingTexts[i];

      // Delay before appearing
      if (this._animTime < ft.delay) continue;

      if (ft.fadeIn) {
        ft.alpha += dt * 0.3;
        if (ft.alpha >= 0.35) {
          ft.alpha = 0.35;
          ft.fadeIn = false;
        }
      } else {
        // Gently bob
        ft.alpha = 0.2 + 0.15 * Math.sin(this._animTime * 0.5 + ft.phase);
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = '#c0c0c0';
      ctx.font = '12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y + Math.sin(this._animTime * 0.3 + ft.phase) * 5);
      ctx.restore();
    }
  };

  /* ---- Depth Ring ---- */

  ReflectionSystem.prototype._renderDepthRing = function (ctx, w, h, portrait) {
    var depth = window.player ? window.player.getDepth() : 0;
    var ratio = depth / 100;
    var ringCx = w / 2;
    var ringCy = h * 0.82;
    var ringR = 40;

    // Background ring
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    // Filled portion
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = portrait.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
    ctx.stroke();

    // Depth number
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = portrait.color;
    ctx.font = '16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(depth, ringCx, ringCy);

    // Label
    ctx.globalAlpha = 0.3;
    ctx.font = '10px Georgia, serif';
    ctx.fillText('深度', ringCx, ringCy + ringR + 14);

    ctx.restore();
  };

  /* ---- Vignette ---- */

  ReflectionSystem.prototype._renderVignette = function (ctx, w, h) {
    var vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  };

  /* ---- Portrait Icon Rendering ---- */

  ReflectionSystem.prototype._renderPortraitIcon = function (ctx, cx, cy, portrait, pulse) {
    ctx.save();
    ctx.globalAlpha = 0.7 * pulse;
    ctx.strokeStyle = portrait.color;
    ctx.fillStyle = portrait.color;
    ctx.lineWidth = 2;

    var r = 30;
    switch (portrait.id) {
      case 'companion': // Two circles side by side
        ctx.beginPath();
        ctx.arc(cx - 15, cy, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 15, cy, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        // Connecting arc
        ctx.beginPath();
        ctx.globalAlpha = 0.3 * pulse;
        ctx.moveTo(cx - 5, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.stroke();
        ctx.globalAlpha = 0.7 * pulse;
        // Small hearts/dots
        ctx.beginPath();
        ctx.arc(cx, cy - 20, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'actor': // Reaching hand
        ctx.beginPath();
        ctx.arc(cx, cy - 10, r * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        // Arm reaching up-right
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy + 5);
        ctx.lineTo(cx + 20, cy - 25);
        ctx.stroke();
        // Star at tip
        ctx.beginPath();
        ctx.arc(cx + 20, cy - 28, 3, 0, Math.PI * 2);
        ctx.fill();
        // Additional sparkle
        ctx.globalAlpha = 0.4 * pulse;
        ctx.beginPath();
        ctx.arc(cx + 25, cy - 22, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 15, cy - 32, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'thinker': // Eye shape
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy);
        ctx.quadraticCurveTo(cx, cy - 20, cx + 25, cy);
        ctx.quadraticCurveTo(cx, cy + 20, cx - 25, cy);
        ctx.closePath();
        ctx.stroke();
        // Pupil
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        // Iris ring
        ctx.globalAlpha = 0.3 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, 10, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'bystander': // Silhouette walking
        // Head
        ctx.beginPath();
        ctx.arc(cx, cy - 18, 8, 0, Math.PI * 2);
        ctx.stroke();
        // Body
        ctx.beginPath();
        ctx.moveTo(cx, cy - 10);
        ctx.lineTo(cx, cy + 10);
        ctx.stroke();
        // Legs (walking)
        ctx.beginPath();
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx - 10, cy + 25);
        ctx.moveTo(cx, cy + 10);
        ctx.lineTo(cx + 10, cy + 25);
        ctx.stroke();
        // Footsteps behind
        ctx.globalAlpha = 0.2 * pulse;
        for (var fi = 1; fi <= 3; fi++) {
          ctx.beginPath();
          ctx.arc(cx - fi * 12, cy + 25, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'rusher': // Blur lines
        for (var li = 0; li < 4; li++) {
          ctx.beginPath();
          ctx.globalAlpha = 0.5 - li * 0.1;
          ctx.moveTo(cx - 15 - li * 8, cy - 10 + li * 5);
          ctx.lineTo(cx - 15 - li * 8, cy + 10 - li * 5);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.7 * pulse;
        // Head
        ctx.beginPath();
        ctx.arc(cx + 5, cy, 6, 0, Math.PI * 2);
        ctx.fill();
        // Speed trail
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.moveTo(cx - 40, cy);
        ctx.lineTo(cx + 5, cy);
        ctx.stroke();
        break;

      case 'wanderer': // Compass rose
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.7);
        ctx.lineTo(cx, cy + r * 0.7);
        ctx.moveTo(cx - r * 0.7, cy);
        ctx.lineTo(cx + r * 0.7, cy);
        ctx.stroke();
        // Diagonal lines
        ctx.globalAlpha = 0.3 * pulse;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.4, cy - r * 0.4);
        ctx.lineTo(cx + r * 0.4, cy + r * 0.4);
        ctx.moveTo(cx + r * 0.4, cy - r * 0.4);
        ctx.lineTo(cx - r * 0.4, cy + r * 0.4);
        ctx.stroke();
        // Center dot
        ctx.globalAlpha = 0.7 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'mirror': // Reflection
        // Face outline
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.stroke();
        // Reflected face below (dimmer)
        ctx.globalAlpha = 0.3 * pulse;
        ctx.beginPath();
        ctx.arc(cx, cy + r * 0.7, r * 0.5, 0, Math.PI, true);
        ctx.stroke();
        // Divider line
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.6, cy + r * 0.35);
        ctx.lineTo(cx + r * 0.6, cy + r * 0.35);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  /* ---- Utility ---- */

  ReflectionSystem.prototype._hexToRgba = function (hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  };

  /* ---- Reset ---- */

  ReflectionSystem.prototype.reset = function () {
    this._portrait = null;
    this._animTime = 0;
    this._particles = [];
    this._starField = [];
    this._floatingTexts = [];
    this._timelineData = [];
    this._initialized = false;
  };

  window.ReflectionSystem = ReflectionSystem;
})();
