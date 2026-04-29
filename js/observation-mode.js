/**
 * ObservationMode — 凝视/观察模式
 * 在场景中发现隐藏细节，积累观察分数
 * 扩展：更多细节、时段依赖、发现进度、粒子效果
 */
(function () {
  'use strict';

  /* ---- Detail data per location ---- */
  var sceneDetails = {
    home: [
      { id: 'home_light', x: 0.3, y: 0.2, text: '窗台上的光尘——微小的颗粒在阳光中旋转，像一个小宇宙。', icon: 'light', periods: ['morning'] },
      { id: 'home_photo', x: 0.7, y: 0.35, text: '墙角的旧照片——你很小的时候，母亲抱着你。她的笑容和你记忆中一样。', icon: 'photo', periods: ['morning'] },
      { id: 'home_warmth', x: 0.5, y: 0.7, text: '空气里飘着热牛奶的味道。这是家的温度。', icon: 'warmth', periods: ['morning'] },
      { id: 'home_mirror', x: 0.85, y: 0.45, text: '镜子里的人看起来比昨天更清醒了一些。或者只是光线好。', icon: 'light', periods: ['morning'] },
      { id: 'home_clock', x: 0.15, y: 0.15, text: '闹钟的秒针在走。每一声滴答都在说：起来吧，新的一天。', icon: 'calendar', periods: ['morning'] },
      { id: 'home_keyhook', x: 0.6, y: 0.55, text: '钥匙挂在门边的钩子上。每次出门前你都会摸一下，确认它还在。', icon: 'mark', periods: ['morning'] },
      { id: 'home_window', x: 0.25, y: 0.3, text: '窗玻璃上有一层薄薄的水雾。你用手指划了一道。窗外的世界变得更清楚了。', icon: 'wind', periods: ['morning'] },
      { id: 'home_shoe', x: 0.4, y: 0.82, text: '门口的鞋子整齐地摆着。左脚那只磨损得更多一些。', icon: 'tracks', periods: ['morning'] },
      { id: 'home_plant', x: 0.78, y: 0.6, text: '小盆栽的新叶刚冒出来。嫩绿色，几乎透明。', icon: 'plant', periods: ['morning'] },
      { id: 'home_spoon', x: 0.55, y: 0.65, text: '桌上的勺子还沾着牛奶的痕迹。今天的早餐很简单，但足够了。', icon: 'note', periods: ['morning'] }
    ],
    street: [
      { id: 'street_cat', x: 0.2, y: 0.7, text: '一只橘猫趴在路边，半眯着眼。它看起来比任何人都从容。', icon: 'cat', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_text', x: 0.8, y: 0.4, text: '墙上贴着一张手写的告示："丢失的猫，橘色，亲人。"——那只猫看起来并不想被找到。', icon: 'text', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_wind', x: 0.5, y: 0.3, text: '风从楼宇之间穿过，带着远处食物的香气和某人的笑声。', icon: 'wind', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_crack', x: 0.6, y: 0.75, text: '人行道的裂缝里长出了一株小草。它选择了最难的路，却走得很坚定。', icon: 'plant', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_shadow', x: 0.35, y: 0.5, text: '一个影子拉得很长，从街角伸到路中间。不知道是谁的。', icon: 'shadow', periods: ['commute-home', 'evening'] },
      { id: 'street_dawn', x: 0.45, y: 0.15, text: '天边的云像打翻的水彩。橘红和灰蓝混在一起。', icon: 'light', periods: ['morning'] },
      { id: 'street_bike', x: 0.72, y: 0.65, text: '一辆旧自行车靠在路灯杆上。前篮里有一束快枯掉的花。', icon: 'plant', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_puddle', x: 0.28, y: 0.8, text: '路边的水洼映出天空。一小片倒过来的世界。', icon: 'shadow', periods: ['commute', 'commute-home'] },
      { id: 'street_graffiti', x: 0.85, y: 0.25, text: '墙角有人用白色喷漆画了一颗小小的星星。只有指甲那么大。', icon: 'sparkle', periods: ['morning', 'commute', 'commute-home', 'evening'] },
      { id: 'street_manhole', x: 0.5, y: 0.6, text: '井盖上的花纹被磨平了一半。地下是另一个世界。', icon: 'map', periods: ['morning', 'commute', 'commute-home', 'evening'] }
    ],
    bus_stop: [
      { id: 'bus_hands', x: 0.4, y: 0.5, text: '老人的手指弯曲着，关节肿大。那双手曾经握过什么？', icon: 'hands', periods: ['commute', 'commute-home'] },
      { id: 'bus_mark', x: 0.6, y: 0.3, text: '车窗上有一道划痕。有人在玻璃上刻了一个小小的爱心。', icon: 'mark', periods: ['commute', 'commute-home'] },
      { id: 'bus_light', x: 0.2, y: 0.2, text: '阳光透过车窗碎片般地洒落，每一个光斑都是一个短暂的微笑。', icon: 'light', periods: ['commute'] },
      { id: 'bus_rain', x: 0.75, y: 0.25, text: '雨滴在车窗上画出河流。每一条都有自己的入海口。', icon: 'wind', periods: ['commute', 'commute-home'] },
      { id: 'bus_reflect', x: 0.5, y: 0.6, text: '车窗映出自己的脸。你看起来比想象中更安静。', icon: 'shadow', periods: ['commute-home'] },
      { id: 'bus_seat', x: 0.3, y: 0.65, text: '座位缝里露出一张糖果纸。红色的。不知道谁留下的甜蜜。', icon: 'note', periods: ['commute', 'commute-home'] },
      { id: 'bus_ticket', x: 0.15, y: 0.35, text: '地上有一张用过的车票。上面的时间是你上车前一个小时。', icon: 'note', periods: ['commute', 'commute-home'] },
      { id: 'bus_pole', x: 0.82, y: 0.45, text: '扶手杆上有一道白色的刮痕。无数只手握过这里。', icon: 'hands', periods: ['commute', 'commute-home'] },
      { id: 'bus_floor', x: 0.48, y: 0.8, text: '车地板上有泥印。雨天留下的痕迹，干了一半。', icon: 'tracks', periods: ['commute', 'commute-home'] },
      { id: 'bus_mirror', x: 0.65, y: 0.15, text: '后视镜里能看到整条车厢。每个人都在看手机。', icon: 'shadow', periods: ['commute', 'commute-home'] }
    ],
    office: [
      { id: 'office_plant', x: 0.15, y: 0.4, text: '角落里的绿萝——没人照顾它，但它一直在长。安静的坚持。', icon: 'plant', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_calendar', x: 0.85, y: 0.2, text: '日历上某一天被圈了起来。没有标注。那天对谁很重要？', icon: 'calendar', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_note', x: 0.5, y: 0.3, text: '李同事桌上有一张便签："没关系，慢慢来。"不知道谁写给他的。', icon: 'note', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_window', x: 0.9, y: 0.15, text: '窗外有只鸟停在空调外机上。它歪着头看着里面的人。', icon: 'cat', periods: ['work', 'afternoon'] },
      { id: 'office_coffee', x: 0.35, y: 0.55, text: '茶水间有人忘记的咖啡杯。杯壁上的咖啡渍像一个笑脸。', icon: 'warmth', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_shadow', x: 0.65, y: 0.45, text: '百叶窗在墙上画出平行的光带。像钢琴的琴键。', icon: 'shadow', periods: ['afternoon'] },
      { id: 'office_printer', x: 0.78, y: 0.7, text: '打印机的待机灯在黑暗中闪烁。绿色。一闪一闪，像在呼吸。', icon: 'sparkle', periods: ['work', 'afternoon'] },
      { id: 'office_sticky', x: 0.22, y: 0.25, text: '你自己的桌上也有便利贴。上面写着："今天也要好好吃饭。"是你写的。', icon: 'note', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_carpet', x: 0.45, y: 0.78, text: '地毯上有一小块磨损了。很多人从那里走过。每一步都有故事。', icon: 'tracks', periods: ['work', 'lunch', 'afternoon'] },
      { id: 'office_dust', x: 0.6, y: 0.15, text: '投影仪的镜头上积了一层薄灰。上次开会是什么时候？', icon: 'sparkle', periods: ['work', 'afternoon'] }
    ],
    park: [
      { id: 'park_tree', x: 0.25, y: 0.5, text: '老榕树的根从地面拱起。它站在这里的时间比任何人都长。', icon: 'tree', periods: ['lunch', 'afternoon', 'evening'] },
      { id: 'park_tracks', x: 0.7, y: 0.6, text: '泥地上有一串脚印——小的，踮着脚的。像是在跳舞。', icon: 'tracks', periods: ['lunch', 'afternoon'] },
      { id: 'park_trail', x: 0.5, y: 0.25, text: '远处的小路弯进树林。没有人走的那条路，不知通向哪里。', icon: 'trail', periods: ['lunch', 'afternoon', 'evening'] },
      { id: 'park_leaf', x: 0.4, y: 0.35, text: '一片落叶在空中旋转了很久才落地。像是最后的表演。', icon: 'plant', periods: ['afternoon', 'evening'] },
      { id: 'park_sky', x: 0.6, y: 0.1, text: '天空中有一朵云像一只兔子。或者像一座山。取决于你。', icon: 'light', periods: ['lunch', 'afternoon'] },
      { id: 'park_dew', x: 0.15, y: 0.45, text: '长椅上有晨露。你没坐下来，但用手划过水痕。凉。', icon: 'wind', periods: ['lunch'] },
      { id: 'park_bench', x: 0.35, y: 0.65, text: '长椅背面上刻着两个字母。已经模糊了，但还认得出是心形的包围。', icon: 'mark', periods: ['lunch', 'afternoon', 'evening'] },
      { id: 'park_ant', x: 0.55, y: 0.72, text: '一队蚂蚁正在搬运面包屑。它们的队伍笔直，目的明确。', icon: 'tracks', periods: ['lunch', 'afternoon'] },
      { id: 'park_feather', x: 0.8, y: 0.35, text: '一根羽毛落在草地上。白色的，很干净。不知道属于哪只鸟。', icon: 'wind', periods: ['lunch', 'afternoon', 'evening'] },
      { id: 'park_swing', x: 0.18, y: 0.58, text: '秋千在微微摇晃。没有风。也许只是刚刚有孩子离开。', icon: 'breath', periods: ['afternoon', 'evening'] }
    ],
    church: [
      { id: 'church_shadow', x: 0.6, y: 0.4, text: '彩色玻璃投下的影子——红与蓝交织，像某种无声的祝福。', icon: 'shadow', periods: ['afternoon', 'evening'] },
      { id: 'church_wind', x: 0.3, y: 0.5, text: '门缝里有风。风里带着蜡烛燃烧后的温暖气味。', icon: 'wind', periods: ['afternoon', 'evening'] },
      { id: 'church_book', x: 0.5, y: 0.6, text: '长椅上放着一本翻开的书。没人读它，但翻到的那一页像是有意为之。', icon: 'book', periods: ['afternoon', 'evening'] },
      { id: 'church_pigeon', x: 0.2, y: 0.55, text: '一只鸽子落在台阶上。它的眼睛像玻璃珠，倒映着整座教堂。', icon: 'cat', periods: ['afternoon'] },
      { id: 'church_bell', x: 0.5, y: 0.15, text: '钟楼上的钟很安静。但你能感觉到它在等待某个时刻。', icon: 'light', periods: ['evening'] },
      { id: 'church_candle', x: 0.7, y: 0.5, text: '烛台上有半截蜡烛。蜡油凝固在边缘，像微小的瀑布。', icon: 'warmth', periods: ['evening'] },
      { id: 'church_floor', x: 0.45, y: 0.72, text: '地砖上有一道裂纹，从墙根延伸到长椅脚下。很老了。', icon: 'trail', periods: ['afternoon', 'evening'] },
      { id: 'church_dust', x: 0.35, y: 0.3, text: '光柱中的微尘缓慢沉降。像是时间变成可见的了。', icon: 'sparkle', periods: ['afternoon'] },
      { id: 'church_bench', x: 0.75, y: 0.65, text: '长椅的扶手磨得很光滑。多少人的手经过这里。', icon: 'hands', periods: ['afternoon', 'evening'] },
      { id: 'church_window', x: 0.15, y: 0.35, text: '窗台上有花瓣。干枯了，但还保持着形状。有人留下的。', icon: 'plant', periods: ['evening'] }
    ],
    night_room: [
      { id: 'night_breath', x: 0.5, y: 0.5, text: '你听见自己的呼吸。在这个安静的夜里，它听起来像是潮汐。', icon: 'breath', periods: ['night'] },
      { id: 'night_light', x: 0.3, y: 0.3, text: '台灯的光晕很小。但它照亮了书桌上的所有东西。', icon: 'light', periods: ['night'] },
      { id: 'night_shadow', x: 0.7, y: 0.6, text: '窗帘的影子在墙上轻轻晃动。像有人在窗外守候。', icon: 'shadow', periods: ['night'] },
      { id: 'night_phone', x: 0.45, y: 0.45, text: '手机屏幕亮了一下。一条未读消息。你决定明天再看。', icon: 'note', periods: ['night'] },
      { id: 'night_moon', x: 0.7, y: 0.12, text: '月亮很圆。它不发出自己的光，但从不缺席。', icon: 'light', periods: ['night'] },
      { id: 'night_wall', x: 0.15, y: 0.4, text: '墙上有一道细小的裂纹。它一直在那里。像时间留下的笔迹。', icon: 'tracks', periods: ['night'] },
      { id: 'night_ceiling', x: 0.5, y: 0.08, text: '天花板的纹理像一幅地图。如果你够仔细，能看见山川和河流。', icon: 'map', periods: ['night'] },
      { id: 'night_bookshelf', x: 0.82, y: 0.35, text: '书架上的书有些歪了。最常翻的那本已经被磨得发白。', icon: 'book', periods: ['night'] },
      { id: 'night_dust', x: 0.2, y: 0.2, text: '浮尘在台灯的光柱里缓缓旋转。像是微型的星系。', icon: 'sparkle', periods: ['night'] },
      { id: 'night_blanket', x: 0.6, y: 0.75, text: '毯子的一角垂在床边。它记得你翻身时所有的犹豫。', icon: 'warmth', periods: ['night'] }
    ]
  };

  /* ---- Shimmer particles ---- */

  var _shimmerParticles = [];

  function _initShimmerParticles(w, h) {
    _shimmerParticles = [];
    for (var i = 0; i < 30; i++) {
      _shimmerParticles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.3 + 0.05,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function _updateShimmerParticles(dt, w, h) {
    for (var i = 0; i < _shimmerParticles.length; i++) {
      var p = _shimmerParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
  }

  function _renderShimmerParticles(ctx, time) {
    for (var i = 0; i < _shimmerParticles.length; i++) {
      var p = _shimmerParticles[i];
      var a = p.alpha * (0.5 + 0.5 * Math.sin(time * 2 + p.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = '#c8b8f0';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---- Sparkle burst particles ---- */

  var _sparkles = [];

  function _spawnSparkles(x, y, count) {
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = Math.random() * 60 + 20;
      _sparkles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.8 + 0.6,
        size: Math.random() * 3 + 1,
        color: Math.random() > 0.5 ? '#e8d8ff' : '#ffe8d8'
      });
    }
  }

  function _updateSparkles(dt) {
    for (var i = _sparkles.length - 1; i >= 0; i--) {
      var s = _sparkles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 30 * dt; // gravity
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        _sparkles.splice(i, 1);
      }
    }
  }

  function _renderSparkles(ctx) {
    for (var i = 0; i < _sparkles.length; i++) {
      var s = _sparkles[i];
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      // Diamond shape for sparkle
      ctx.moveTo(s.x, s.y - s.size);
      ctx.lineTo(s.x + s.size * 0.6, s.y);
      ctx.lineTo(s.x, s.y + s.size);
      ctx.lineTo(s.x - s.size * 0.6, s.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /* ---- Breathing ring ---- */

  function _renderBreathingRing(ctx, cx, cy, time, alpha) {
    var breathPhase = Math.sin(time * 1.2) * 0.5 + 0.5; // 0..1
    var outerR = 25 + breathPhase * 10;
    var innerR = 15 + breathPhase * 5;

    ctx.save();
    ctx.globalAlpha = alpha * 0.15;

    // Outer breathing circle
    ctx.strokeStyle = '#b0a0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.stroke();

    // Inner breathing circle
    ctx.strokeStyle = '#c0b0f0';
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /* ---- Constructor ---- */

  function ObservationMode() {
    this._active = false;
    this._details = [];
    this._selectedIdx = -1;
    this._animTime = 0;
    this._confirmedDetail = null;
    this._fadeAlpha = 0;
    this._totalDiscovered = 0;
    this._sessionDiscovered = 0;
    this._lastConfirmTime = 0;
    this._lastSparkleTime = 0;
    this._hintAlpha = 1.0;
    this._completionBonusGiven = {};
  }

  /* ---- Toggle ---- */

  ObservationMode.prototype.toggle = function () {
    if (this._active) {
      this.deactivate();
    } else {
      this.activate();
    }
  };

  ObservationMode.prototype.activate = function () {
    var locId = window.player.getLocation();
    var period = window.timeSystem ? window.timeSystem.getPeriod() : 'morning';
    var details = sceneDetails[locId];
    if (!details || details.length === 0) return;

    // Filter by period and already-discovered
    var available = [];
    for (var i = 0; i < details.length; i++) {
      if (window.player.hasFlag('obs_' + details[i].id)) continue;
      if (details[i].periods && details[i].periods.indexOf(period) === -1) continue;
      available.push(details[i]);
    }
    if (available.length === 0) {
      window.ui.showNarration('你已经仔细看过这里的一切了。');
      return;
    }

    this._active = true;
    this._details = available;
    this._selectedIdx = 0;
    this._confirmedDetail = null;
    this._fadeAlpha = 0;

    window.ui.hideExits();
    window.ui.showGaze();
    if (window._setGameState) window._setGameState('observation');
  };

  ObservationMode.prototype.deactivate = function () {
    this._active = false;
    this._details = [];
    this._selectedIdx = -1;
    this._confirmedDetail = null;
    this._fadeAlpha = 0;

    window.ui.hideGaze();
    if (window._setGameState) window._setGameState('playing');

    // Show exits again
    var exits = window.gameMap.getAvailableExits();
    if (exits.length > 0) {
      window.ui.showExits(exits);
    }
  };

  ObservationMode.prototype.isActive = function () {
    return this._active;
  };

  /* ---- Stats ---- */

  ObservationMode.prototype.getDiscoveredCount = function () {
    return this._totalDiscovered;
  };

  ObservationMode.prototype.getSessionDiscovered = function () {
    return this._sessionDiscovered;
  };

  ObservationMode.prototype.getStats = function () {
    var totalPossible = 0;
    for (var loc in sceneDetails) {
      if (sceneDetails.hasOwnProperty(loc)) {
        totalPossible += sceneDetails[loc].length;
      }
    }
    return {
      totalDiscovered: this._totalDiscovered,
      sessionDiscovered: this._sessionDiscovered,
      totalPossible: totalPossible,
      completionRate: totalPossible > 0 ? this._totalDiscovered / totalPossible : 0
    };
  };

  ObservationMode.prototype.getDetailsForLocation = function (locId) {
    return sceneDetails[locId] || [];
  };

  /* ---- Update ---- */

  ObservationMode.prototype.update = function (dt) {
    if (!this._active) return;
    this._animTime += dt;

    // Fade in effect
    if (this._fadeAlpha < 1) {
      this._fadeAlpha = Math.min(1, this._fadeAlpha + dt * 2);
    }

    // Hint text fade
    if (this._animTime > 8) {
      this._hintAlpha = Math.max(0, this._hintAlpha - dt * 0.3);
    }

    // Update shimmer particles
    if (_shimmerParticles.length > 0) {
      var canvas = window.gameMap ? window.gameMap.canvas : null;
      if (canvas) {
        _updateShimmerParticles(dt, canvas.width, canvas.height);
      }
    }

    // Update sparkle burst particles
    _updateSparkles(dt);
  };

  /* ---- Input ---- */

  ObservationMode.prototype.handleInput = function (key) {
    if (!this._active) return false;

    // Confirmed detail: Space/Enter to dismiss
    if (this._confirmedDetail) {
      if (key === ' ' || key === 'Enter') {
        this._confirmedDetail = null;
      }
      return true;
    }

    // Escape: deactivate
    if (key === 'Escape') {
      this.deactivate();
      return true;
    }

    // Navigation
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this._selectedIdx = (this._selectedIdx - 1 + this._details.length) % this._details.length;
      return true;
    }
    if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this._selectedIdx = (this._selectedIdx + 1) % this._details.length;
      return true;
    }

    // Tab: cycle through hotspots
    if (key === 'Tab') {
      this._selectedIdx = (this._selectedIdx + 1) % this._details.length;
      return true;
    }

    // Confirm selection
    if (key === ' ' || key === 'Enter') {
      this.confirmDetail();
      return true;
    }

    return true; // consume all keys while active
  };

  /* ---- Touch Input ---- */

  ObservationMode.prototype.handleTouch = function (tx, ty, w, h) {
    if (!this._active) return;

    // If confirmed detail is showing, dismiss it
    if (this._confirmedDetail) {
      this._confirmedDetail = null;
      return;
    }

    // Check if touch hits any hotspot
    var hitRadius = 0.06; // relative radius for touch hit detection
    for (var i = 0; i < this._details.length; i++) {
      var d = this._details[i];
      var dx = (tx / w) - d.x;
      var dy = (ty / h) - d.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < hitRadius) {
        this._selectedIdx = i;
        this.confirmDetail();
        return;
      }
    }
  };

  ObservationMode.prototype.confirmDetail = function () {
    if (this._selectedIdx < 0 || this._selectedIdx >= this._details.length) return;
    var detail = this._details[this._selectedIdx];

    // Mark as discovered
    window.player.setFlag('obs_' + detail.id);
    window.player.addDepth(2);
    window.player.recordChoice('obs_' + detail.id, 'observant');
    window.player.recordObservation(detail.id);

    this._confirmedDetail = detail;
    this._totalDiscovered++;
    this._sessionDiscovered++;
    this._lastConfirmTime = this._animTime;
    this._lastSparkleTime = this._animTime;

    // Spawn sparkle burst at detail position
    var canvas = window.gameMap ? window.gameMap.canvas : null;
    if (canvas) {
      _spawnSparkles(detail.x * canvas.width, detail.y * canvas.height, 12);
    }

    // Remove from available list
    this._details.splice(this._selectedIdx, 1);
    if (this._details.length === 0) {
      this._selectedIdx = -1;
      // All details found at this location
      if (window.player) {
        window.player.addJournalEntry('你仔细观察了' + (window.gameMap.getCurrentLocation() ? window.gameMap.getCurrentLocation().name : '这里') + '的每一个角落。');
      }
    } else {
      this._selectedIdx = Math.min(this._selectedIdx, this._details.length - 1);
    }
  };

  /* ---- Render ---- */

  ObservationMode.prototype.render = function (ctx, w, h) {
    if (!this._active) return;

    var alpha = this._fadeAlpha;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Semi-transparent overlay with vignette
    ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
    ctx.fillRect(0, 0, w, h);

    // Vignette edges
    var vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    vigGrad.addColorStop(0, 'rgba(0, 0, 20, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 20, 0.4)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    // Initialize shimmer particles on first render
    if (_shimmerParticles.length === 0) {
      _initShimmerParticles(w, h);
    }
    _renderShimmerParticles(ctx, this._animTime);

    // Render sparkle bursts
    _renderSparkles(ctx);

    // Render confirmed detail (full-screen text)
    if (this._confirmedDetail) {
      this._renderConfirmedDetail(ctx, w, h);
      ctx.restore();
      return;
    }

    // Breathing ring around center
    _renderBreathingRing(ctx, w / 2, h / 2, this._animTime, alpha);

    // Render detail hotspots
    for (var i = 0; i < this._details.length; i++) {
      var d = this._details[i];
      var px = w * d.x;
      var py = h * d.y;
      var isSelected = (i === this._selectedIdx);
      this._renderHotspot(ctx, px, py, d, isSelected, w, h);
    }

    // Discovery counter
    var locId = window.player ? window.player.getLocation() : '';
    var allDetails = sceneDetails[locId] || [];
    var discoveredHere = 0;
    for (var di = 0; di < allDetails.length; di++) {
      if (window.player && window.player.hasFlag('obs_' + allDetails[di].id)) {
        discoveredHere++;
      }
    }
    ctx.globalAlpha = alpha * 0.5;
    ctx.font = '12px Georgia, serif';
    ctx.fillStyle = '#9090b0';
    ctx.textAlign = 'right';
    ctx.fillText('发现 ' + discoveredHere + '/' + allDetails.length, w - 20, 60);

    // Session counter
    ctx.font = '11px Georgia, serif';
    ctx.fillStyle = '#8080a0';
    ctx.fillText('本次 ' + this._sessionDiscovered, w - 20, 78);

    // Instructions (fade out over time)
    ctx.globalAlpha = alpha * this._hintAlpha * 0.6;
    ctx.font = '13px Georgia, serif';
    ctx.fillStyle = '#b0b0d0';
    ctx.textAlign = 'center';
    ctx.fillText('轻触亮点观察  ·  再次点击凝视按钮退出', w / 2, h - 30);

    ctx.restore();
  };

  ObservationMode.prototype._renderHotspot = function (ctx, x, y, detail, selected, w, h) {
    var pulse = Math.sin(this._animTime * 3) * 0.15 + 0.85;

    // Outer glow
    var radius = selected ? 28 : 20;
    ctx.save();
    ctx.globalAlpha *= pulse;

    // Outer ring (expanding pulse)
    if (selected) {
      var ringPhase = (this._animTime * 2) % 1;
      var ringR = radius + ringPhase * 15;
      ctx.strokeStyle = 'rgba(180, 160, 255, ' + (0.3 * (1 - ringPhase)) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, ringR, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Glow circle
    var grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, selected ? 'rgba(200, 180, 255, 0.4)' : 'rgba(150, 150, 200, 0.2)');
    grad.addColorStop(1, 'rgba(100, 100, 180, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    this._drawIcon(ctx, detail.icon, x, y, selected ? 1.0 : 0.5, 10);

    ctx.restore();

    // Selected: show label
    if (selected) {
      ctx.save();
      ctx.font = '14px Georgia, serif';
      ctx.fillStyle = '#d0c8f0';
      ctx.textAlign = 'center';
      ctx.globalAlpha *= 0.9;

      // Label background
      var labelY = y - 38;
      var textW = ctx.measureText('……').width + 20;
      ctx.fillStyle = 'rgba(20, 15, 40, 0.7)';
      ctx.fillRect(x - textW / 2, labelY - 12, textW, 24);

      ctx.fillStyle = '#d0c8f0';
      ctx.fillText('……', x, labelY + 5);
      ctx.restore();
    }
  };

  ObservationMode.prototype._renderConfirmedDetail = function (ctx, w, h) {
    var d = this._confirmedDetail;

    // Dark overlay
    ctx.fillStyle = 'rgba(10, 5, 25, 0.85)';
    ctx.fillRect(0, 0, w, h);

    // Icon (large, centered)
    var cx = w / 2;
    var cy = h / 2 - 60;

    // Soft glow behind icon
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    glow.addColorStop(0, 'rgba(180, 160, 255, 0.3)');
    glow.addColorStop(1, 'rgba(100, 80, 200, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.fill();

    // Shimmer ring around icon
    var shimmerAlpha = 0.2 + 0.15 * Math.sin(this._animTime * 4);
    ctx.strokeStyle = 'rgba(200, 180, 255, ' + shimmerAlpha + ')';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 40 + Math.sin(this._animTime * 2) * 5, 0, Math.PI * 2);
    ctx.stroke();

    this._drawIcon(ctx, d.icon, cx, cy, 1.0, 24);

    // "+2 深度" indicator
    ctx.save();
    var depthAlpha = Math.max(0, 1 - (this._animTime - this._lastConfirmTime) * 0.8);
    ctx.globalAlpha = depthAlpha;
    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = '#d8c890';
    ctx.textAlign = 'center';
    ctx.fillText('+2 深度', cx, cy + 25);
    ctx.restore();

    // Text
    ctx.font = '16px Georgia, serif';
    ctx.fillStyle = '#d8d0f0';
    ctx.textAlign = 'center';
    this._wrapText(ctx, d.text, cx, cy + 50, w * 0.7, 26);

    // Dismiss hint
    ctx.font = '12px Georgia, serif';
    ctx.fillStyle = 'rgba(160, 150, 200, 0.6)';
    ctx.fillText('轻触继续', cx, h - 50);
  };

  /* ---- Icon Renderer ---- */

  ObservationMode.prototype._drawIcon = function (ctx, type, x, y, alpha, size) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.strokeStyle = '#c8b8f0';
    ctx.fillStyle = '#c8b8f0';
    ctx.lineWidth = 1.5;

    var s = size;

    switch (type) {
      case 'light': // Sun
        ctx.beginPath();
        ctx.arc(x, y, s * 0.4, 0, Math.PI * 2);
        ctx.fill();
        for (var i = 0; i < 8; i++) {
          var angle = (Math.PI * 2 / 8) * i;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * s * 0.55, y + Math.sin(angle) * s * 0.55);
          ctx.lineTo(x + Math.cos(angle) * s * 0.8, y + Math.sin(angle) * s * 0.8);
          ctx.stroke();
        }
        break;

      case 'photo': // Rectangle with inner frame
        ctx.strokeRect(x - s * 0.5, y - s * 0.35, s, s * 0.7);
        ctx.strokeRect(x - s * 0.35, y - s * 0.2, s * 0.7, s * 0.4);
        break;

      case 'warmth': // Wave lines
        ctx.beginPath();
        for (var wi = 0; wi < 3; wi++) {
          var wy = y - s * 0.3 + wi * s * 0.3;
          ctx.moveTo(x - s * 0.5, wy);
          ctx.quadraticCurveTo(x - s * 0.25, wy - s * 0.15, x, wy);
          ctx.quadraticCurveTo(x + s * 0.25, wy + s * 0.15, x + s * 0.5, wy);
        }
        ctx.stroke();
        break;

      case 'cat': // Triangle ears + circle head
        ctx.beginPath();
        ctx.arc(x, y + s * 0.1, s * 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.moveTo(x - s * 0.35, y - s * 0.15);
        ctx.lineTo(x - s * 0.15, y - s * 0.5);
        ctx.lineTo(x, y - s * 0.1);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + s * 0.35, y - s * 0.15);
        ctx.lineTo(x + s * 0.15, y - s * 0.5);
        ctx.lineTo(x, y - s * 0.1);
        ctx.fill();
        break;

      case 'text': // Horizontal lines
        for (var li = 0; li < 3; li++) {
          var ly = y - s * 0.25 + li * s * 0.25;
          var lw = li === 1 ? s * 0.6 : s * 0.8;
          ctx.beginPath();
          ctx.moveTo(x - lw / 2, ly);
          ctx.lineTo(x + lw / 2, ly);
          ctx.stroke();
        }
        break;

      case 'tree': // Line trunk + circle canopy
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.4);
        ctx.lineTo(x, y - s * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - s * 0.3, s * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'mark': // Heart shape
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.3);
        ctx.bezierCurveTo(x - s * 0.5, y - s * 0.1, x - s * 0.25, y - s * 0.5, x, y - s * 0.2);
        ctx.bezierCurveTo(x + s * 0.25, y - s * 0.5, x + s * 0.5, y - s * 0.1, x, y + s * 0.3);
        ctx.fill();
        break;

      case 'hands': // Curved lines
        ctx.beginPath();
        ctx.arc(x - s * 0.2, y, s * 0.3, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s * 0.2, y, s * 0.3, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
        break;

      case 'plant': // Stem + small leaves
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.4);
        ctx.lineTo(x, y - s * 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x - s * 0.2, y - s * 0.1, s * 0.15, s * 0.08, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + s * 0.2, y, s * 0.15, s * 0.08, 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'calendar': // Grid
        var gs = s * 0.3;
        for (var gi = 0; gi < 3; gi++) {
          for (var gj = 0; gj < 3; gj++) {
            ctx.strokeRect(x - gs * 1.5 + gi * gs, y - gs * 1.5 + gj * gs, gs, gs);
          }
        }
        break;

      case 'note': // Small rectangle
        ctx.fillRect(x - s * 0.25, y - s * 0.35, s * 0.5, s * 0.7);
        ctx.strokeStyle = 'rgba(20, 15, 40, 0.5)';
        ctx.lineWidth = 1;
        for (var ni = 0; ni < 3; ni++) {
          var ny = y - s * 0.2 + ni * s * 0.2;
          ctx.beginPath();
          ctx.moveTo(x - s * 0.15, ny);
          ctx.lineTo(x + s * 0.15, ny);
          ctx.stroke();
        }
        break;

      case 'tracks': // Dot trail
        for (var di = 0; di < 4; di++) {
          var ddx = x - s * 0.3 + di * s * 0.2;
          var ddy = y + Math.sin(di * 1.2) * s * 0.15;
          ctx.beginPath();
          ctx.arc(ddx, ddy, s * 0.06, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'trail': // Dashed line curving
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(x - s * 0.5, y + s * 0.3);
        ctx.quadraticCurveTo(x, y - s * 0.3, x + s * 0.5, y + s * 0.1);
        ctx.stroke();
        ctx.setLineDash([]);
        break;

      case 'shadow': // Diagonal lines
        for (var si = 0; si < 3; si++) {
          ctx.beginPath();
          ctx.moveTo(x - s * 0.4 + si * s * 0.3, y - s * 0.4);
          ctx.lineTo(x - s * 0.2 + si * s * 0.3, y + s * 0.4);
          ctx.stroke();
        }
        break;

      case 'wind': // Wavy line
        ctx.beginPath();
        ctx.moveTo(x - s * 0.5, y);
        ctx.bezierCurveTo(x - s * 0.25, y - s * 0.3, x + s * 0.25, y + s * 0.3, x + s * 0.5, y);
        ctx.stroke();
        break;

      case 'book': // Open book shape
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.05);
        ctx.lineTo(x - s * 0.4, y - s * 0.3);
        ctx.lineTo(x - s * 0.4, y + s * 0.3);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y + s * 0.05);
        ctx.lineTo(x + s * 0.4, y - s * 0.3);
        ctx.lineTo(x + s * 0.4, y + s * 0.3);
        ctx.closePath();
        ctx.stroke();
        break;

      case 'breath': // Small waves
        for (var bi = 0; bi < 2; bi++) {
          ctx.beginPath();
          var by = y - s * 0.15 + bi * s * 0.3;
          ctx.moveTo(x - s * 0.3, by);
          ctx.quadraticCurveTo(x - s * 0.15, by - s * 0.12, x, by);
          ctx.quadraticCurveTo(x + s * 0.15, by + s * 0.12, x + s * 0.3, by);
          ctx.stroke();
        }
        break;

      case 'sparkle': // Four-pointed star
        ctx.beginPath();
        ctx.moveTo(x, y - s * 0.5);
        ctx.lineTo(x + s * 0.12, y - s * 0.12);
        ctx.lineTo(x + s * 0.5, y);
        ctx.lineTo(x + s * 0.12, y + s * 0.12);
        ctx.lineTo(x, y + s * 0.5);
        ctx.lineTo(x - s * 0.12, y + s * 0.12);
        ctx.lineTo(x - s * 0.5, y);
        ctx.lineTo(x - s * 0.12, y - s * 0.12);
        ctx.closePath();
        ctx.fill();
        break;

      case 'map': // Folded rectangle with lines
        ctx.strokeRect(x - s * 0.4, y - s * 0.35, s * 0.8, s * 0.7);
        // Fold line
        ctx.beginPath();
        ctx.moveTo(x - s * 0.4, y - s * 0.1);
        ctx.lineTo(x + s * 0.4, y - s * 0.1);
        ctx.stroke();
        // Inner details
        ctx.beginPath();
        ctx.moveTo(x - s * 0.2, y + s * 0.15);
        ctx.lineTo(x + s * 0.1, y - s * 0.2);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  /* ---- Text Wrapping ---- */

  ObservationMode.prototype._wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
    var lines = [];
    var line = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var testLine = line + ch;
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line);
        line = ch;
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    var startY = y - ((lines.length - 1) * lineHeight) / 2;
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, startY + j * lineHeight);
    }
  };

  window.ObservationMode = ObservationMode;
})();
