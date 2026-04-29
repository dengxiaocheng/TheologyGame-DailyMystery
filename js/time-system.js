/**
 * TimeSystem — 时间系统
 * 管理游戏内时间流逝、天气变化、温度、光照、环境描述
 */
(function () {
  'use strict';

  var DAY_START = 420;
  var DAY_END = 1380;
  var DAY_RANGE = DAY_END - DAY_START;

  var PERIODS = [
    { id: 'morning',      start: 420,  end: 480,  label: '清晨', icon: '🌅', color: '#FFD080', desc: '新的一天开始了' },
    { id: 'commute',      start: 480,  end: 540,  label: '通勤', icon: '🚌', color: '#FFB060', desc: '城市正在苏醒' },
    { id: 'work',         start: 540,  end: 720,  label: '工作', icon: '💼', color: '#C8C8DC', desc: '日光灯下的日常' },
    { id: 'lunch',        start: 720,  end: 780,  label: '午间', icon: '🍱', color: '#FFD878', desc: '短暂的喘息' },
    { id: 'afternoon',    start: 780,  end: 960,  label: '午后', icon: '☕', color: '#C8C8D0', desc: '时间变得缓慢' },
    { id: 'commute-home', start: 960,  end: 1020, label: '归途', icon: '🌆', color: '#DCA064', desc: '天色渐暗' },
    { id: 'evening',      start: 1020, end: 1200, label: '傍晚', icon: '🌙', color: '#B47850', desc: '一天的尾声' },
    { id: 'night',        start: 1200, end: 1380, label: '夜晚', icon: '🌃', color: '#28203C', desc: '归于沉寂' }
  ];

  var WEATHERS = {
    clear:  { label: '晴',  tempMod: 0,  skyAlpha: 0,    particleType: 'none' },
    cloudy: { label: '多云', tempMod: -2, skyAlpha: 0.08, particleType: 'none' },
    rainy:  { label: '雨',  tempMod: -5, skyAlpha: 0.15, particleType: 'rain' },
    foggy:  { label: '雾',  tempMod: -3, skyAlpha: 0.12, particleType: 'fog' },
    windy:  { label: '风',  tempMod: -2, skyAlpha: 0,    particleType: 'wind' },
    snowy:  { label: '雪',  tempMod: -8, skyAlpha: 0.1,  particleType: 'snow' }
  };

  var WEATHER_WEIGHTS = [
    { id: 'clear',  w: 35 },
    { id: 'cloudy', w: 25 },
    { id: 'rainy',  w: 15 },
    { id: 'foggy',  w: 10 },
    { id: 'windy',  w: 10 },
    { id: 'snowy',  w: 5  }
  ];

  var AMBIENT_PERIOD = {
    morning: [
      '闹钟响了。窗帘缝隙透进来的光是灰白色的。',
      '厨房传来轻微的响动。水壶开始嗡鸣。',
      '空气里有昨晚残留的寂静。',
      '你听见鸟叫。很轻，像是从很远的地方传来。',
      '被子还带着体温。窗外已经有光。',
      '天花板上的裂纹在晨光中格外清晰。'
    ],
    commute: [
      '街道上行人匆匆，脚步声汇成一片。',
      '公交车缓缓驶来，车窗蒙着一层薄雾。',
      '路边的早餐店飘出蒸汽，气味模糊而温暖。',
      '红绿灯变了又变，人群涌动又停驻。',
      '空气中有汽车尾气和豆浆的混合气味。',
      '天空的颜色还没完全亮透。'
    ],
    work: [
      '办公室的日光灯嗡嗡作响。',
      '键盘的敲击声此起彼伏，像一场无声的对话。',
      '窗外的光线很稳定，像静止了一样。',
      '打印机吐出一叠纸，机械而规律。',
      '茶水间传来水壶烧开的声音。',
      '有人在隔壁小声打电话。'
    ],
    lunch: [
      '食堂里弥漫着食物的气味。',
      '午后的阳光铺在桌面上，温暖而均匀。',
      '人群的声音汇成模糊的嗡鸣。',
      '筷子碰到碗碟的声音清脆而密集。',
      '有人在谈论周末的计划。',
      '窗外的树在风中轻轻摇摆。'
    ],
    afternoon: [
      '下午的空气有些沉闷。',
      '时钟的指针似乎走得更慢了。',
      '远处有人在低声交谈，听不清说什么。',
      '电脑屏幕上的光映在桌面上。',
      '窗外的光影角度变了。',
      '有人打了个哈欠。'
    ],
    'commute-home': [
      '天边的颜色开始变化，从白到橙到灰。',
      '公交车里的人比早上更安静。',
      '路灯逐一亮起来，像被依次唤醒。',
      '车窗上映着车厢内的面孔。',
      '广播里播报着下一站的名字。',
      '有人在打电话，声音很轻。'
    ],
    evening: [
      '暮色从天际蔓延开来。',
      '街道上的影子越来越长，最后融为一体。',
      '空气中有一丝凉意，像什么东西即将结束。',
      '便利店的白光从门缝中泻出。',
      '远处传来广场舞的音乐。',
      '天空还剩最后一抹橙色。'
    ],
    night: [
      '房间很安静。冰箱的低鸣成了唯一的声响。',
      '窗外只有零星的路灯，远处有模糊的车声。',
      '夜色浓重，像一个深呼吸。',
      '邻居家传来隐约的电视声。',
      '手机屏幕的光映在天花板上。',
      '一切都慢下来了。'
    ]
  };

  var AMBIENT_LOCATION = {
    home: {
      morning: '水龙头哗哗响着。冰箱的嗡嗡声很近。桌上还有昨夜没收的杯子。',
      commute: '出门前最后看了一眼房间。阳光照在地板上，尘埃浮动。',
      evening: '窗帘被风轻轻推动。夕阳在墙上画出缓慢移动的光斑。',
      night: '一切都安静下来。只有冰箱的低鸣，和窗外偶尔的车声。'
    },
    street: {
      morning: '早市刚刚开始摆摊。空气里有油条和豆浆的气味。',
      commute: '行人的脚步声汇成一片。每个人都在赶路。',
      'commute-home': '路灯在湿地上画出模糊的光圈。有人在等红灯。',
      evening: '小餐馆的灯箱亮了起来。油烟从排风口飘出。',
      night: '街道空旷了。只有路灯和偶尔经过的出租车。'
    },
    bus_stop: {
      morning: '等车的人们缩在站台上。有人在看手机，有人在发呆。',
      commute: '公交车来了。车窗上有雾气，看不清里面。',
      'commute-home': '归途的车厢里很安静。窗外的城市向后退去。',
      evening: '末班车前的站台。人不多。'
    },
    office: {
      morning: '还没到上班时间，办公室只有几个人。灯还没全开。',
      work: '打印机的声音夹杂着低语。咖啡机在角落里嗡嗡作响。',
      lunch: '休息区只有几个人。微波炉在运转，发出均匀的嗡声。',
      afternoon: '下午茶时间，有人端着杯子走过。走廊里回荡着脚步声。',
      'commute-home': '办公室的人陆续离开。日光灯还亮着。'
    },
    park: {
      morning: '公园里只有晨练的老人。鸟叫声很清脆。',
      lunch: '阳光穿过树叶，在地上画出斑驳的光影。',
      afternoon: '长椅上有几个老人在下棋。棋子落下的声音清脆。',
      evening: '公园里的人渐渐少了。喷泉还在不知疲倦地运转。',
      night: '公园的灯关了大半。小路在夜色中消失。'
    },
    church: {
      morning: '教堂在晨光中显得格外安静。墙壁上的砖纹清晰可见。',
      evening: '教堂的钟声回荡在空旷的街道。鸽子在钟楼上栖息。',
      night: '教堂的轮廓在夜色中隐约可见。彩色玻璃窗完全暗了下来。'
    },
    night_room: {
      night: '手机屏幕是房间里唯一的光源。通知栏空空荡荡。'
    }
  };

  var SEASON_HINTS = [
    '空气干燥，像被拧干的毛巾。',
    '风里带着泥土的气味，像要下雨。',
    '天很蓝，蓝得有些不真实。',
    '云层很厚，压得很低。',
    '阳光很烈，但风是凉的。',
    '远处的山隐在雾里，看不清轮廓。'
  ];

  function TimeSystem() {
    this._minutes = DAY_START;
    this._rate = 1;
    this._paused = true;
    this._weather = 'clear';
    this._prevWeather = 'clear';
    this._weatherTimer = 0;
    this._weatherDuration = 300;
    this._particles = [];
    this._lightningAlpha = 0;
    this._fogPhase = 0;
    this._seasonHint = SEASON_HINTS[Math.floor(Math.random() * SEASON_HINTS.length)];
    this._pickWeather();
    this._initParticles();
  }

  TimeSystem.prototype._initParticles = function () {
    this._particles = [];
    var count = 80;
    for (var i = 0; i < count; i++) {
      this._particles.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.2 + Math.random() * 0.5,
        size: 1 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 0.3,
        alpha: 0.15 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  };

  TimeSystem.prototype._updateParticles = function (dt) {
    var w = this._weather;
    for (var i = 0; i < this._particles.length; i++) {
      var p = this._particles[i];
      if (w === 'rainy') {
        p.y += p.speed * dt * 0.7;
        p.x += p.drift * dt * 0.15;
      } else if (w === 'snowy') {
        p.y += p.speed * dt * 0.12;
        p.x += Math.sin(p.phase + p.y * 8) * 0.004;
      } else if (w === 'windy') {
        p.x += p.speed * dt * 0.25;
        p.y += p.drift * dt * 0.08;
      } else {
        p.x += Math.sin(p.phase + p.y * 4) * 0.0004;
        p.y += 0.00015;
      }
      if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
      if (p.x > 1.05) { p.x = -0.05; }
      if (p.x < -0.05) { p.x = 1.05; }
    }
    if (w === 'rainy' && Math.random() < 0.0008) {
      this._lightningAlpha = 0.35;
    }
    if (this._lightningAlpha > 0) {
      this._lightningAlpha -= dt * 1.8;
      if (this._lightningAlpha < 0) this._lightningAlpha = 0;
    }
    this._fogPhase += dt * 0.3;
  };

  TimeSystem.prototype._pickWeather = function () {
    this._prevWeather = this._weather;
    var total = 0;
    for (var i = 0; i < WEATHER_WEIGHTS.length; i++) total += WEATHER_WEIGHTS[i].w;
    var r = Math.random() * total;
    var acc = 0;
    for (var j = 0; j < WEATHER_WEIGHTS.length; j++) {
      acc += WEATHER_WEIGHTS[j].w;
      if (r <= acc) { this._weather = WEATHER_WEIGHTS[j].id; break; }
    }
    this._weatherDuration = 250 + Math.random() * 300;
    this._weatherTimer = 0;
  };

  /* ---- Core Time ---- */

  TimeSystem.prototype.update = function (dt) {
    if (this._paused) return;
    this._minutes += this._rate * dt;
    if (this._minutes > DAY_END) this._minutes = DAY_END;
    this._weatherTimer += dt;
    if (this._weatherTimer >= this._weatherDuration) this._pickWeather();
    this._updateParticles(dt);
  };

  TimeSystem.prototype.getDisplayTime = function () {
    var h = Math.floor(this._minutes / 60);
    var m = Math.floor(this._minutes % 60);
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  };

  TimeSystem.prototype.getPeriod = function () {
    for (var i = 0; i < PERIODS.length; i++) {
      if (this._minutes >= PERIODS[i].start && this._minutes < PERIODS[i].end) {
        return PERIODS[i].id;
      }
    }
    return 'night';
  };

  TimeSystem.prototype.addMinutes = function (n) {
    this._minutes += n;
    if (this._minutes > DAY_END) this._minutes = DAY_END;
  };

  TimeSystem.prototype.isDayOver = function () {
    return this._minutes >= DAY_END;
  };

  TimeSystem.prototype.pause = function () { this._paused = true; };
  TimeSystem.prototype.resume = function () { this._paused = false; };

  /* ---- Weather ---- */

  TimeSystem.prototype.getWeather = function () { return this._weather; };

  TimeSystem.prototype.getWeatherLabel = function () {
    return WEATHERS[this._weather] ? WEATHERS[this._weather].label : '晴';
  };

  TimeSystem.prototype.getWeatherData = function () {
    return WEATHERS[this._weather] || WEATHERS.clear;
  };

  TimeSystem.prototype.getTemperature = function () {
    var period = this.getPeriod();
    var base;
    switch (period) {
      case 'morning':      base = 14; break;
      case 'commute':      base = 16; break;
      case 'work':         base = 20; break;
      case 'lunch':        base = 22; break;
      case 'afternoon':    base = 21; break;
      case 'commute-home': base = 18; break;
      case 'evening':      base = 15; break;
      case 'night':        base = 12; break;
      default:             base = 18;
    }
    var wData = WEATHERS[this._weather];
    return (base + (wData ? wData.tempMod : 0)) + '°C';
  };

  /* ---- Period Metadata ---- */

  TimeSystem.prototype.getPeriodMeta = function () {
    var period = this.getPeriod();
    for (var i = 0; i < PERIODS.length; i++) {
      if (PERIODS[i].id === period) return PERIODS[i];
    }
    return PERIODS[PERIODS.length - 1];
  };

  TimeSystem.prototype.getDayProgress = function () {
    return Math.max(0, Math.min(1, (this._minutes - DAY_START) / DAY_RANGE));
  };

  TimeSystem.prototype.getPeriodProgress = function () {
    var p = this.getPeriodMeta();
    var range = p.end - p.start;
    if (range <= 0) return 1;
    return Math.max(0, Math.min(1, (this._minutes - p.start) / range));
  };

  TimeSystem.prototype.getLightLevel = function () {
    var progress = this.getDayProgress();
    if (progress < 0.1) return 0.3 + progress * 5;
    if (progress < 0.8) return 0.8 + 0.2 * Math.sin((progress - 0.1) / 0.7 * Math.PI);
    return 0.3 + (1 - progress) * 3.5;
  };

  TimeSystem.prototype.getSkyGradient = function (ctx, w, h) {
    var period = this.getPeriod();
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    switch (period) {
      case 'morning':
        grad.addColorStop(0, '#1a1a3e');
        grad.addColorStop(0.4, '#4a3070');
        grad.addColorStop(0.7, '#e08860');
        grad.addColorStop(1, '#ffd080');
        break;
      case 'commute':
        grad.addColorStop(0, '#3a5080');
        grad.addColorStop(0.5, '#80a8d0');
        grad.addColorStop(1, '#e0c890');
        break;
      case 'work':
        grad.addColorStop(0, '#5080b0');
        grad.addColorStop(0.5, '#80b0d0');
        grad.addColorStop(1, '#c0d0e0');
        break;
      case 'lunch':
        grad.addColorStop(0, '#6090c0');
        grad.addColorStop(0.5, '#90c0e0');
        grad.addColorStop(1, '#d0d8e0');
        break;
      case 'afternoon':
        grad.addColorStop(0, '#5080a0');
        grad.addColorStop(0.5, '#80a8c0');
        grad.addColorStop(1, '#b8c0c8');
        break;
      case 'commute-home':
        grad.addColorStop(0, '#404070');
        grad.addColorStop(0.4, '#806060');
        grad.addColorStop(0.7, '#c08050');
        grad.addColorStop(1, '#e0a060');
        break;
      case 'evening':
        grad.addColorStop(0, '#1a1a40');
        grad.addColorStop(0.3, '#3a2a50');
        grad.addColorStop(0.7, '#805040');
        grad.addColorStop(1, '#c07040');
        break;
      case 'night':
        grad.addColorStop(0, '#0a0a1a');
        grad.addColorStop(0.4, '#141428');
        grad.addColorStop(0.7, '#1a1a30');
        grad.addColorStop(1, '#20203a');
        break;
      default:
        grad.addColorStop(0, '#000');
        grad.addColorStop(1, '#111');
    }
    return grad;
  };

  /* ---- Ambient Descriptions ---- */

  TimeSystem.prototype.getAmbientDescription = function (locId) {
    var period = this.getPeriod();
    if (AMBIENT_LOCATION[locId] && AMBIENT_LOCATION[locId][period]) {
      return AMBIENT_LOCATION[locId][period];
    }
    return this.getPeriodAmbient();
  };

  TimeSystem.prototype.getPeriodAmbient = function () {
    var period = this.getPeriod();
    if (AMBIENT_PERIOD[period]) {
      var t = AMBIENT_PERIOD[period];
      return t[Math.floor(Math.random() * t.length)];
    }
    return '';
  };

  TimeSystem.prototype.getSeasonHint = function () {
    return this._seasonHint;
  };

  /* ---- Weather Rendering ---- */

  TimeSystem.prototype.renderWeather = function (ctx, w, h) {
    var wd = WEATHERS[this._weather];
    if (!wd) return;

    if (wd.skyAlpha > 0) {
      ctx.fillStyle = 'rgba(60, 60, 80, ' + wd.skyAlpha + ')';
      ctx.fillRect(0, 0, w, h);
    }

    if (this._weather === 'foggy') {
      ctx.fillStyle = 'rgba(160, 160, 180, 0.05)';
      ctx.fillRect(0, 0, w, h);
      for (var f = 0; f < 4; f++) {
        var fy = h * (0.2 + f * 0.18) + Math.sin(this._fogPhase + f * 1.5) * 25;
        var fh = h * 0.12;
        ctx.fillStyle = 'rgba(180, 180, 200, ' + (0.03 + Math.sin(this._fogPhase * 0.5 + f) * 0.015) + ')';
        ctx.fillRect(0, fy, w, fh);
      }
    }

    if (this._lightningAlpha > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, ' + this._lightningAlpha + ')';
      ctx.fillRect(0, 0, w, h);
    }

    for (var i = 0; i < this._particles.length; i++) {
      var p = this._particles[i];
      var px = p.x * w;
      var py = p.y * h;

      if (this._weather === 'rainy') {
        ctx.strokeStyle = 'rgba(140, 170, 210, ' + (p.alpha * 0.5) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + p.drift * 4, py + p.size * 10);
        ctx.stroke();
      } else if (this._weather === 'snowy') {
        ctx.fillStyle = 'rgba(230, 230, 250, ' + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this._weather === 'windy') {
        ctx.strokeStyle = 'rgba(190, 190, 210, ' + (p.alpha * 0.25) + ')';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + p.size * 14, py + p.drift * 3);
        ctx.stroke();
      }
    }
  };

  window.TimeSystem = TimeSystem;
})();
