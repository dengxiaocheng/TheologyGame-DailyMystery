/**
 * GameMap — 地图与场景系统
 * 管理地点数据、导航和Canvas场景渲染
 * 支持天气响应渲染、时段视觉变化、粒子特效
 */
(function () {
  'use strict';

  function GameMap(canvas) {
    this.canvas = canvas;
    this.locations = {
      home: {
        name: '家',
        periods: ['morning'],
        exits: [{ key: 'E', label: '出门', target: 'street' }]
      },
      street: {
        name: '街道',
        periods: ['morning', 'commute', 'commute-home', 'evening'],
        exits: [
          { key: 'W', label: '回家', target: 'home' },
          { key: 'N', label: '公交站', target: 'bus_stop' },
          { key: 'E', label: '公园', target: 'park' },
          { key: 'S', label: '教堂', target: 'church' }
        ]
      },
      bus_stop: {
        name: '公交车上',
        periods: ['commute', 'commute-home'],
        exits: [
          { key: 'E', label: '下车→办公室', target: 'office', period: 'commute' },
          { key: 'E', label: '下车→回家', target: 'street', period: 'commute-home' }
        ]
      },
      office: {
        name: '办公室',
        periods: ['work', 'lunch', 'afternoon'],
        exits: [{ key: 'W', label: '离开', target: 'street' }]
      },
      park: {
        name: '公园',
        periods: ['lunch', 'afternoon', 'evening'],
        exits: [{ key: 'W', label: '离开', target: 'street' }]
      },
      church: {
        name: '教堂外',
        periods: ['afternoon', 'evening'],
        exits: [{ key: 'W', label: '离开', target: 'street' }]
      },
      night_room: {
        name: '夜晚房间',
        periods: ['night'],
        exits: [{ key: 'S', label: '结束一天', target: '__end_day__' }]
      }
    };

    // Particle system for weather & environmental effects
    this._particles = [];
    this._maxParticles = 80;
    this._lastWeather = null;
    this._lastPeriod = null;
    this._animTime = 0;
  }

  /* ---- Location Queries ---- */

  GameMap.prototype.getCurrentLocation = function () {
    return this.locations[window.player.getLocation()];
  };

  GameMap.prototype.changeLocation = function (id) {
    // Special: end the day
    if (id === '__end_day__') {
      window.ui.hideExits();
      if (window._endDay) window._endDay();
      return true;
    }
    if (!this.locations[id]) return false;
    var period = window.timeSystem.getPeriod();
    if (!this.isLocationAccessible(id, period)) return false;

    window.player.setLocation(id);
    var loc = this.locations[id];

    // Clear particles on location change
    this._particles = [];

    // Show narration for new location
    window.ui.hideExits();
    window.ui.showNarration(loc.name);

    // After a brief moment, check for events or show exits
    setTimeout(function () {
      window.ui.hideNarration();

      // Check for events at this location
      var event = window.eventSystem.checkForEvents(id, window.timeSystem.getPeriod());
      if (event) {
        // Trigger event after short delay
        setTimeout(function () {
          window.eventSystem.triggerEvent(event);
          if (window._setGameState) window._setGameState('event');
        }, 500);
      } else {
        var exits = window.gameMap.getAvailableExits();
        if (exits.length > 0) {
          window.ui.showExits(exits);
        }
      }
    }, 1200);

    return true;
  };

  GameMap.prototype.getAvailableExits = function () {
    var locId = window.player.getLocation();
    var loc = this.locations[locId];
    if (!loc) return [];

    var period = window.timeSystem.getPeriod();

    // For bus_stop, filter exits by current period
    if (locId === 'bus_stop') {
      return loc.exits.filter(function (e) {
        return e.period === period;
      });
    }

    return loc.exits.slice();
  };

  GameMap.prototype.isLocationAccessible = function (id, period) {
    var loc = this.locations[id];
    if (!loc) return false;
    return loc.periods.indexOf(period) !== -1;
  };

  /* ---- Weather & Particle System ---- */

  GameMap.prototype._getWeatherType = function () {
    if (!window.timeSystem || !window.timeSystem.getWeather) return 'clear';
    return window.timeSystem.getWeather();
  };

  GameMap.prototype._shouldSpawnParticle = function (weather) {
    if (this._particles.length >= this._maxParticles) return false;
    switch (weather) {
      case 'rain': return Math.random() < 0.6;
      case 'snow': return Math.random() < 0.3;
      case 'wind': return Math.random() < 0.2;
      case 'fog': return Math.random() < 0.1;
      default: return Math.random() < 0.05;
    }
  };

  GameMap.prototype._spawnParticle = function (weather, w, h) {
    var p = {
      x: Math.random() * w,
      y: -10,
      vx: 0,
      vy: 0,
      size: 1,
      alpha: 0.5,
      life: 1,
      type: weather
    };

    switch (weather) {
      case 'rain':
        p.vy = 300 + Math.random() * 200;
        p.vx = 30 + Math.random() * 20;
        p.size = 1.5;
        p.alpha = 0.4 + Math.random() * 0.3;
        break;
      case 'snow':
        p.vy = 30 + Math.random() * 40;
        p.vx = (Math.random() - 0.5) * 30;
        p.size = 2 + Math.random() * 3;
        p.alpha = 0.5 + Math.random() * 0.4;
        break;
      case 'wind':
        p.vy = (Math.random() - 0.5) * 20;
        p.vx = 100 + Math.random() * 150;
        p.size = 1 + Math.random() * 2;
        p.alpha = 0.2 + Math.random() * 0.2;
        p.y = Math.random() * h;
        break;
      case 'fog':
        p.y = Math.random() * h;
        p.size = 40 + Math.random() * 60;
        p.alpha = 0.05 + Math.random() * 0.08;
        p.vy = (Math.random() - 0.5) * 5;
        break;
      default: // clear — floating dust motes
        p.y = Math.random() * h;
        p.vy = (Math.random() - 0.5) * 10;
        p.vx = (Math.random() - 0.5) * 10;
        p.size = 1 + Math.random();
        p.alpha = 0.1 + Math.random() * 0.15;
        break;
    }

    this._particles.push(p);
  };

  GameMap.prototype._updateParticles = function (dt, w, h) {
    for (var i = this._particles.length - 1; i >= 0; i--) {
      var p = this._particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Wind sway for snow
      if (p.type === 'snow') {
        p.x += Math.sin(this._animTime * 2 + i) * 15 * dt;
      }

      // Remove if out of bounds
      if (p.y > h + 20 || p.y < -30 || p.x > w + 20 || p.x < -20) {
        this._particles.splice(i, 1);
      }
    }
  };

  GameMap.prototype._renderParticles = function (ctx, w, h) {
    for (var i = 0; i < this._particles.length; i++) {
      var p = this._particles[i];
      ctx.save();
      ctx.globalAlpha = p.alpha;

      switch (p.type) {
        case 'rain':
          ctx.strokeStyle = 'rgba(180, 200, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.02, p.y - p.vy * 0.02);
          ctx.stroke();
          break;

        case 'snow':
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'wind':
          ctx.strokeStyle = 'rgba(200, 200, 180, 0.3)';
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y);
          ctx.stroke();
          break;

        case 'fog':
          var fogGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
          fogGrad.addColorStop(0, 'rgba(200, 200, 220, 0.08)');
          fogGrad.addColorStop(1, 'rgba(200, 200, 220, 0)');
          ctx.fillStyle = fogGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;

        default: // dust motes
          ctx.fillStyle = 'rgba(255, 255, 230, 0.3)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();
    }
  };

  GameMap.prototype._renderWeatherOverlay = function (ctx, w, h, weather) {
    switch (weather) {
      case 'rain':
        ctx.fillStyle = 'rgba(30, 40, 60, 0.15)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'snow':
        ctx.fillStyle = 'rgba(200, 200, 230, 0.08)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'fog':
        ctx.fillStyle = 'rgba(180, 180, 200, 0.2)';
        ctx.fillRect(0, 0, w, h);
        break;
      case 'overcast':
        ctx.fillStyle = 'rgba(60, 60, 70, 0.12)';
        ctx.fillRect(0, 0, w, h);
        break;
    }
  };

  /* ---- Rendering ---- */

  GameMap.prototype.render = function (ctx, timePeriod) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    var locId = window.player.getLocation();
    var weather = this._getWeatherType();

    // Update animation time
    this._animTime += 0.016;

    // Spawn particles
    if (this._shouldSpawnParticle(weather)) {
      this._spawnParticle(weather, w, h);
    }
    this._updateParticles(0.016, w, h);

    switch (locId) {
      case 'home': this._renderHome(ctx, w, h, timePeriod, weather); break;
      case 'street': this._renderStreet(ctx, w, h, timePeriod, weather); break;
      case 'bus_stop': this._renderBusStop(ctx, w, h, timePeriod, weather); break;
      case 'office': this._renderOffice(ctx, w, h, timePeriod, weather); break;
      case 'park': this._renderPark(ctx, w, h, timePeriod, weather); break;
      case 'church': this._renderChurch(ctx, w, h, timePeriod, weather); break;
      case 'night_room': this._renderNightRoom(ctx, w, h, timePeriod, weather); break;
      default: this._renderHome(ctx, w, h, timePeriod, weather); break;
    }

    // Render weather overlay & particles
    this._renderWeatherOverlay(ctx, w, h, weather);
    this._renderParticles(ctx, w, h);
  };

  /* -- Home -- */

  GameMap.prototype._renderHome = function (ctx, w, h, period, weather) {
    // Background: warm dark
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#2a1f14');
    bg.addColorStop(1, '#1a120a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Window with warm yellow light
    var winX = w * 0.7, winY = h * 0.1, winW = w * 0.15, winH = h * 0.25;
    // Light glow
    var glow = ctx.createRadialGradient(winX + winW / 2, winY + winH / 2, 10, winX + winW / 2, winY + winH / 2, winW * 2);
    glow.addColorStop(0, 'rgba(255, 220, 120, 0.15)');
    glow.addColorStop(1, 'rgba(255, 220, 120, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Window frame
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(winX, winY, winW, winH);
    // Morning light through window
    var isOvercast = (weather === 'overcast' || weather === 'rain');
    ctx.fillStyle = isOvercast ? 'rgba(200, 200, 210, 0.4)' : 'rgba(255, 230, 150, 0.6)';
    ctx.fillRect(winX + 4, winY + 4, winW - 8, winH - 8);
    // Window cross
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(winX + winW / 2, winY);
    ctx.lineTo(winX + winW / 2, winY + winH);
    ctx.moveTo(winX, winY + winH / 2);
    ctx.lineTo(winX + winW, winY + winH / 2);
    ctx.stroke();

    // Light rays from window onto floor
    ctx.save();
    ctx.globalAlpha = isOvercast ? 0.05 : 0.12;
    ctx.fillStyle = '#ffe896';
    ctx.beginPath();
    ctx.moveTo(winX, winY + winH);
    ctx.lineTo(winX + winW, winY + winH);
    ctx.lineTo(winX + winW + w * 0.1, h * 0.85);
    ctx.lineTo(winX - w * 0.05, h * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Bed
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(w * 0.1, h * 0.65, w * 0.35, h * 0.12);
    // Pillow
    ctx.fillStyle = '#6a5a4a';
    ctx.fillRect(w * 0.1, h * 0.62, w * 0.1, h * 0.05);
    // Blanket
    ctx.fillStyle = 'rgba(100, 80, 140, 0.5)';
    ctx.fillRect(w * 0.1, h * 0.68, w * 0.35, h * 0.06);
    // Blanket fold line
    ctx.strokeStyle = 'rgba(120, 100, 160, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.71);
    ctx.lineTo(w * 0.45, h * 0.71);
    ctx.stroke();

    // Nightstand
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(w * 0.47, h * 0.66, w * 0.08, h * 0.08);
    // Alarm clock
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(w * 0.49, h * 0.64, w * 0.04, h * 0.03);
    // Clock display
    ctx.fillStyle = 'rgba(100, 200, 100, 0.6)';
    ctx.fillRect(w * 0.495, h * 0.645, w * 0.03, h * 0.02);

    // Door outline
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.45, h * 0.4, w * 0.12, h * 0.35);
    // Door handle
    ctx.fillStyle = '#8a7a5a';
    ctx.beginPath();
    ctx.arc(w * 0.54, h * 0.58, 4, 0, Math.PI * 2);
    ctx.fill();

    // Wardrobe
    ctx.fillStyle = '#3a2e1e';
    ctx.fillRect(w * 0.58, h * 0.38, w * 0.1, h * 0.32);
    ctx.strokeStyle = '#4a3e2e';
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.58, h * 0.38, w * 0.1, h * 0.32);
    // Wardrobe line
    ctx.beginPath();
    ctx.moveTo(w * 0.63, h * 0.38);
    ctx.lineTo(w * 0.63, h * 0.70);
    ctx.stroke();

    // Floor
    ctx.fillStyle = 'rgba(80, 60, 40, 0.3)';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    // Floor board lines
    ctx.strokeStyle = 'rgba(90, 70, 50, 0.15)';
    ctx.lineWidth = 1;
    for (var fx = 0; fx < w; fx += w * 0.08) {
      ctx.beginPath();
      ctx.moveTo(fx, h * 0.78);
      ctx.lineTo(fx, h);
      ctx.stroke();
    }
  };

  /* -- Street -- */

  GameMap.prototype._renderStreet = function (ctx, w, h, period, weather) {
    // Background: dark blue-gray
    var isEvening = (period === 'evening' || period === 'commute-home');
    var isMorning = (period === 'morning');
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    if (isMorning) {
      bg.addColorStop(0, '#2a2a4a');
      bg.addColorStop(0.4, '#3a3a5a');
      bg.addColorStop(1, '#1a1a3a');
    } else if (isEvening) {
      bg.addColorStop(0, '#1a1a2e');
      bg.addColorStop(1, '#0f0f1e');
    } else {
      bg.addColorStop(0, '#2a2a3a');
      bg.addColorStop(1, '#1a1a2a');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Morning light streaks
    if (isMorning && weather !== 'overcast' && weather !== 'rain') {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#ffd866';
      ctx.beginPath();
      ctx.moveTo(w * 0.9, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w * 0.7, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Buildings silhouettes
    ctx.fillStyle = '#0f0f18';
    var buildings = [
      [0.02, 0.15, 0.12, 0.5],
      [0.16, 0.08, 0.10, 0.57],
      [0.28, 0.18, 0.14, 0.47],
      [0.55, 0.12, 0.11, 0.53],
      [0.68, 0.06, 0.13, 0.59],
      [0.83, 0.14, 0.15, 0.51]
    ];
    for (var i = 0; i < buildings.length; i++) {
      ctx.fillRect(w * buildings[i][0], h * buildings[i][1], w * buildings[i][2], h * buildings[i][3]);
    }

    // Building windows (lit)
    var windowAlpha = isEvening ? 0.5 : 0.3;
    ctx.fillStyle = 'rgba(255, 220, 120, ' + windowAlpha + ')';
    for (var bi = 0; bi < buildings.length; bi++) {
      var bx = buildings[bi][0], by = buildings[bi][1], bw = buildings[bi][2], bh = buildings[bi][3];
      for (var wy = by + 0.04; wy < by + bh - 0.04; wy += 0.08) {
        for (var wx = bx + 0.02; wx < bx + bw - 0.02; wx += 0.04) {
          if (Math.random() > 0.5) {
            ctx.fillRect(w * wx, h * wy, w * 0.015, h * 0.03);
          }
        }
      }
    }

    // Rooftop details (antennas, vents)
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 2;
    for (var ri = 0; ri < buildings.length; ri++) {
      var rbx = buildings[ri][0], rby = buildings[ri][1];
      // Antenna
      ctx.beginPath();
      ctx.moveTo(w * (rbx + 0.05), h * rby);
      ctx.lineTo(w * (rbx + 0.05), h * (rby - 0.03));
      ctx.stroke();
    }

    // Road
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(0, h * 0.68, w, h * 0.08);
    // Road lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.lineTo(w, h * 0.72);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sidewalk
    ctx.fillStyle = 'rgba(60, 60, 70, 0.5)';
    ctx.fillRect(0, h * 0.76, w, h * 0.04);

    // Street lamp
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.76);
    ctx.lineTo(w * 0.5, h * 0.35);
    ctx.lineTo(w * 0.52, h * 0.35);
    ctx.stroke();
    // Lamp light — brighter at evening/night
    var lampIntensity = isEvening ? 0.4 : 0.2;
    var lampGlow = ctx.createRadialGradient(w * 0.51, h * 0.35, 5, w * 0.51, h * 0.45, w * 0.12);
    lampGlow.addColorStop(0, 'rgba(255, 230, 150, ' + lampIntensity + ')');
    lampGlow.addColorStop(1, 'rgba(255, 230, 150, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(w * 0.51, h * 0.35, w * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Second lamp
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.76);
    ctx.lineTo(w * 0.2, h * 0.42);
    ctx.lineTo(w * 0.22, h * 0.42);
    ctx.stroke();
    var lampGlow2 = ctx.createRadialGradient(w * 0.21, h * 0.42, 3, w * 0.21, h * 0.50, w * 0.08);
    lampGlow2.addColorStop(0, 'rgba(255, 230, 150, ' + (lampIntensity * 0.6) + ')');
    lampGlow2.addColorStop(1, 'rgba(255, 230, 150, 0)');
    ctx.fillStyle = lampGlow2;
    ctx.beginPath();
    ctx.arc(w * 0.21, h * 0.50, w * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Tree on sidewalk
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(w * 0.8, h * 0.55, 5, h * 0.21);
    ctx.fillStyle = isEvening ? '#1a3a1a' : '#2a5a2a';
    ctx.beginPath();
    ctx.arc(w * 0.802, h * 0.5, Math.max(1, w * 0.03), 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(w * 0.79, h * 0.52, Math.max(1, w * 0.025), 0, Math.PI * 2);
    ctx.fill();

    // Trash can
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(w * 0.62, h * 0.72, w * 0.03, h * 0.04);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(w * 0.615, h * 0.715, w * 0.04, h * 0.01);

    // Ground
    ctx.fillStyle = 'rgba(30, 30, 40, 0.8)';
    ctx.fillRect(0, h * 0.80, w, h * 0.20);
  };

  /* -- Bus Stop (interior) -- */

  GameMap.prototype._renderBusStop = function (ctx, w, h, period, weather) {
    // Background: dim yellow-gray interior
    var isCommuteHome = (period === 'commute-home');
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    if (isCommuteHome) {
      bg.addColorStop(0, '#2a2520');
      bg.addColorStop(1, '#1a1a15');
    } else {
      bg.addColorStop(0, '#3a352a');
      bg.addColorStop(1, '#2a251a');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Ceiling
    ctx.fillStyle = '#4a453a';
    ctx.fillRect(0, 0, w, h * 0.08);

    // Windows with motion blur
    for (var i = 0; i < 4; i++) {
      var wx = w * 0.15 + i * w * 0.2;
      var wy = h * 0.12;
      var ww = w * 0.14;
      var wh = h * 0.25;

      // Sky through window
      var skyColor = isCommuteHome ? 'rgba(40, 30, 50, 0.4)' : 'rgba(150, 170, 200, 0.3)';
      ctx.fillStyle = skyColor;
      ctx.fillRect(wx, wy, ww, wh);

      // Motion blur streaks
      ctx.strokeStyle = isCommuteHome ? 'rgba(60, 50, 70, 0.15)' : 'rgba(200, 210, 230, 0.15)';
      ctx.lineWidth = 1;
      for (var s = 0; s < 5; s++) {
        var sy = wy + Math.random() * wh;
        ctx.beginPath();
        ctx.moveTo(wx, sy);
        ctx.lineTo(wx + ww, sy - 5 + Math.random() * 10);
        ctx.stroke();
      }
      // Frame
      ctx.strokeStyle = '#5a5540';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, wy, ww, wh);

      // Passing buildings (blur rectangles)
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#1a1a2a';
      var buildOffset = (this._animTime * 50 + i * 80) % (w + 100);
      ctx.fillRect(wx + buildOffset % ww - 10, wy + wh * 0.3, 8, wh * 0.5);
      ctx.fillRect(wx + (buildOffset + 30) % ww, wy + wh * 0.2, 6, wh * 0.6);
      ctx.restore();
    }

    // Seats — rows
    ctx.fillStyle = '#5a4a3a';
    for (var row = 0; row < 3; row++) {
      var ry = h * 0.45 + row * h * 0.14;
      // Left seat
      ctx.fillRect(w * 0.1, ry, w * 0.3, h * 0.04);
      // Right seat
      ctx.fillRect(w * 0.6, ry, w * 0.3, h * 0.04);
      // Back rests
      ctx.fillStyle = '#6a5a4a';
      ctx.fillRect(w * 0.1, ry - h * 0.06, w * 0.3, h * 0.05);
      ctx.fillRect(w * 0.6, ry - h * 0.06, w * 0.3, h * 0.05);
      ctx.fillStyle = '#5a4a3a';
    }

    // Handrail
    ctx.strokeStyle = '#8a8a7a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.4);
    ctx.lineTo(w * 0.95, h * 0.4);
    ctx.stroke();
    // Handrail poles
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, h * 0.08);
    ctx.lineTo(w * 0.05, h * 0.4);
    ctx.moveTo(w * 0.95, h * 0.08);
    ctx.lineTo(w * 0.95, h * 0.4);
    ctx.stroke();

    // Floor
    ctx.fillStyle = 'rgba(60, 55, 45, 0.5)';
    ctx.fillRect(0, h * 0.85, w, h * 0.15);
    // Floor rubber pattern
    ctx.strokeStyle = 'rgba(70, 65, 55, 0.3)';
    ctx.lineWidth = 1;
    for (var fx = 0; fx < w; fx += 15) {
      ctx.beginPath();
      ctx.moveTo(fx, h * 0.85);
      ctx.lineTo(fx, h);
      ctx.stroke();
    }
  };

  /* -- Office -- */

  GameMap.prototype._renderOffice = function (ctx, w, h, period, weather) {
    // Background varies by period
    var isLunch = (period === 'lunch');
    var isAfternoon = (period === 'afternoon');
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    if (isLunch) {
      bg.addColorStop(0, '#c8c0b8');
      bg.addColorStop(1, '#9a9590');
    } else if (isAfternoon) {
      bg.addColorStop(0, '#c0b8b0');
      bg.addColorStop(1, '#908a85');
    } else {
      bg.addColorStop(0, '#d0d0d0');
      bg.addColorStop(1, '#a0a0a0');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Fluorescent ceiling lights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (var li = 0; li < 3; li++) {
      ctx.fillRect(w * 0.15 + li * w * 0.28, h * 0.03, w * 0.18, h * 0.015);
    }
    // Light glow
    for (var gi = 0; gi < 3; gi++) {
      var lx = w * 0.24 + gi * w * 0.28;
      var lightGlow = ctx.createRadialGradient(lx, h * 0.05, 5, lx, h * 0.2, h * 0.2);
      lightGlow.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      lightGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = lightGlow;
      ctx.fillRect(0, 0, w, h * 0.4);
    }

    // Desk grid — 3 rows x 2 cols
    for (var r = 0; r < 2; r++) {
      for (var c = 0; c < 3; c++) {
        var dx = w * 0.08 + c * w * 0.3;
        var dy = h * 0.2 + r * h * 0.35;
        var dw = w * 0.24;
        var dh = h * 0.14;

        // Desk surface
        ctx.fillStyle = '#b0a890';
        ctx.fillRect(dx, dy, dw, dh);
        // Monitor
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(dx + dw * 0.3, dy + dh * 0.05, dw * 0.4, dh * 0.55);
        // Screen glow
        var screenColor = isLunch ? 'rgba(100, 140, 200, 0.15)' : 'rgba(100, 140, 200, 0.3)';
        ctx.fillStyle = screenColor;
        ctx.fillRect(dx + dw * 0.32, dy + dh * 0.07, dw * 0.36, dh * 0.45);
        // Keyboard
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(dx + dw * 0.25, dy + dh * 0.7, dw * 0.5, dh * 0.15);
        // Coffee cup on some desks
        if ((r + c) % 2 === 0) {
          ctx.fillStyle = '#e0e0e0';
          ctx.beginPath();
          ctx.arc(dx + dw * 0.85, dy + dh * 0.6, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#6a4a2a';
          ctx.beginPath();
          ctx.arc(dx + dw * 0.85, dy + dh * 0.58, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Whiteboard on wall
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(w * 0.35, h * 0.06, w * 0.3, h * 0.06);
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 1;
    ctx.strokeRect(w * 0.35, h * 0.06, w * 0.3, h * 0.06);
    // Writing on whiteboard
    ctx.strokeStyle = 'rgba(50, 50, 200, 0.2)';
    ctx.lineWidth = 1;
    for (var li2 = 0; li2 < 3; li2++) {
      ctx.beginPath();
      ctx.moveTo(w * 0.37, h * 0.08 + li2 * h * 0.015);
      ctx.lineTo(w * 0.55, h * 0.08 + li2 * h * 0.015);
      ctx.stroke();
    }

    // Plant in corner
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(w * 0.92, h * 0.5, w * 0.05, h * 0.06);
    ctx.fillStyle = '#3a6a3a';
    ctx.beginPath();
    ctx.arc(w * 0.945, h * 0.47, Math.max(1, w * 0.025), 0, Math.PI * 2);
    ctx.fill();

    // Clock on wall
    ctx.fillStyle = '#d0d0d0';
    ctx.beginPath();
    ctx.arc(w * 0.15, h * 0.1, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#606060';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.1);
    ctx.lineTo(w * 0.15 + 6, h * 0.1 - 4);
    ctx.moveTo(w * 0.15, h * 0.1);
    ctx.lineTo(w * 0.15, h * 0.1 - 7);
    ctx.stroke();

    // Floor
    ctx.fillStyle = 'rgba(160, 155, 145, 0.6)';
    ctx.fillRect(0, h * 0.82, w, h * 0.18);
    // Tile pattern
    ctx.strokeStyle = 'rgba(140, 135, 125, 0.3)';
    ctx.lineWidth = 1;
    for (var tx = 0; tx < w; tx += w * 0.06) {
      ctx.beginPath();
      ctx.moveTo(tx, h * 0.82);
      ctx.lineTo(tx, h);
      ctx.stroke();
    }
  };

  /* -- Park -- */

  GameMap.prototype._renderPark = function (ctx, w, h, period, weather) {
    // Background varies by period
    var isEvening = (period === 'evening');
    var isLunch = (period === 'lunch');
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    if (isEvening) {
      bg.addColorStop(0, '#2a1a2a');
      bg.addColorStop(0.5, '#3a2020');
      bg.addColorStop(1, '#1a1a1a');
    } else if (isLunch) {
      bg.addColorStop(0, '#5a8aaa');
      bg.addColorStop(0.6, '#8abaaa');
      bg.addColorStop(1, '#4a6a3a');
    } else {
      bg.addColorStop(0, '#6a9aba');
      bg.addColorStop(0.6, '#7aaa7a');
      bg.addColorStop(1, '#4a7a3a');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Clouds (if overcast)
    if (weather === 'overcast' || weather === 'rain') {
      ctx.fillStyle = 'rgba(120, 120, 130, 0.3)';
      ctx.beginPath();
      ctx.arc(w * 0.3, h * 0.08, 30, 0, Math.PI * 2);
      ctx.arc(w * 0.35, h * 0.06, 25, 0, Math.PI * 2);
      ctx.arc(w * 0.4, h * 0.08, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w * 0.7, h * 0.1, 25, 0, Math.PI * 2);
      ctx.arc(w * 0.75, h * 0.08, 20, 0, Math.PI * 2);
      ctx.arc(w * 0.8, h * 0.1, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sun/Moon
    if (isLunch || (!isEvening)) {
      var sunAlpha = (weather === 'overcast' || weather === 'rain') ? 0.2 : 0.6;
      ctx.fillStyle = 'rgba(255, 240, 180, ' + sunAlpha + ')';
      ctx.beginPath();
      ctx.arc(w * 0.8, h * 0.12, Math.max(1, w * 0.04), 0, Math.PI * 2);
      ctx.fill();
      // Sun glow
      if (sunAlpha > 0.3) {
        var sunGlow = ctx.createRadialGradient(w * 0.8, h * 0.12, 5, w * 0.8, h * 0.12, w * 0.1);
        sunGlow.addColorStop(0, 'rgba(255, 240, 180, 0.15)');
        sunGlow.addColorStop(1, 'rgba(255, 240, 180, 0)');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(w * 0.8, h * 0.12, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (isEvening) {
      ctx.fillStyle = 'rgba(255, 150, 80, 0.5)';
      ctx.beginPath();
      ctx.arc(w * 0.75, h * 0.15, Math.max(1, w * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }

    // Trees
    var trees = [
      [0.08, 0.3], [0.22, 0.25], [0.75, 0.28], [0.9, 0.32], [0.55, 0.22]
    ];
    for (var ti = 0; ti < trees.length; ti++) {
      var ttx = w * trees[ti][0];
      var tty = h * trees[ti][1];
      // Trunk
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(ttx - 4, tty, 8, h * 0.15);
      // Canopy
      ctx.fillStyle = isEvening ? '#2a4a2a' : '#3a6a2a';
      ctx.beginPath();
      ctx.arc(ttx, tty - h * 0.02, Math.max(1, w * 0.04), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isEvening ? '#1a3a1a' : '#2a5a1a';
      ctx.beginPath();
      ctx.arc(ttx - w * 0.015, tty + h * 0.01, Math.max(1, w * 0.03), 0, Math.PI * 2);
      ctx.fill();
    }

    // Flowers along path
    if (!isEvening) {
      var flowerColors = ['#d84040', '#d8d040', '#d070d0', '#4080d8'];
      for (var fi = 0; fi < 8; fi++) {
        var ffx = w * (0.15 + fi * 0.1);
        var ffy = h * 0.74 + Math.sin(fi * 1.5) * h * 0.02;
        ctx.fillStyle = flowerColors[fi % flowerColors.length];
        ctx.beginPath();
        ctx.arc(ffx, ffy, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3a6a2a';
        ctx.fillRect(ffx - 0.5, ffy, 1, 6);
      }
    }

    // Path
    ctx.fillStyle = 'rgba(180, 170, 140, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.3, h * 0.65, w * 0.5, h * 0.68);
    ctx.quadraticCurveTo(w * 0.7, h * 0.71, w, h * 0.66);
    ctx.lineTo(w, h * 0.72);
    ctx.quadraticCurveTo(w * 0.7, h * 0.77, w * 0.5, h * 0.74);
    ctx.quadraticCurveTo(w * 0.3, h * 0.71, 0, h * 0.76);
    ctx.closePath();
    ctx.fill();

    // Bench
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(w * 0.42, h * 0.62, w * 0.12, h * 0.025);
    // Bench legs
    ctx.fillRect(w * 0.43, h * 0.645, 4, h * 0.03);
    ctx.fillRect(w * 0.53, h * 0.645, 4, h * 0.03);
    // Bench back
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(w * 0.42, h * 0.595, w * 0.12, h * 0.025);

    // Fountain (center)
    ctx.fillStyle = 'rgba(120, 130, 150, 0.5)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.82, w * 0.06, h * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100, 140, 180, 0.3)';
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.81, w * 0.05, h * 0.01, 0, 0, Math.PI * 2);
    ctx.fill();

    // Birds (if clear weather)
    if (weather === 'clear' && !isEvening) {
      ctx.strokeStyle = 'rgba(40, 40, 40, 0.3)';
      ctx.lineWidth = 1;
      for (var bird = 0; bird < 3; bird++) {
        var birdX = w * (0.3 + bird * 0.2);
        var birdY = h * (0.12 + bird * 0.03);
        ctx.beginPath();
        ctx.moveTo(birdX - 6, birdY + 3);
        ctx.quadraticCurveTo(birdX - 3, birdY, birdX, birdY + 2);
        ctx.quadraticCurveTo(birdX + 3, birdY, birdX + 6, birdY + 3);
        ctx.stroke();
      }
    }

    // Ground / grass
    ctx.fillStyle = isEvening ? 'rgba(30, 50, 30, 0.6)' : 'rgba(60, 100, 40, 0.4)';
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
  };

  /* -- Church -- */

  GameMap.prototype._renderChurch = function (ctx, w, h, period, weather) {
    var isEvening = (period === 'evening');
    // Background: deep purple-blue
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    if (isEvening) {
      bg.addColorStop(0, '#0f0820');
      bg.addColorStop(1, '#080510');
    } else {
      bg.addColorStop(0, '#1a1030');
      bg.addColorStop(1, '#0f0a1a');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Stars (more visible in evening)
    var starCount = isEvening ? 30 : 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (var si = 0; si < starCount; si++) {
      var sx = Math.random() * w;
      var sy = Math.random() * h * 0.3;
      var ss = 1 + Math.random();
      ctx.fillRect(sx, sy, ss, ss);
    }

    // Moon (evening only)
    if (isEvening) {
      ctx.fillStyle = 'rgba(220, 220, 240, 0.5)';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.08, 12, 0, Math.PI * 2);
      ctx.fill();
      var moonGlow = ctx.createRadialGradient(w * 0.85, h * 0.08, 5, w * 0.85, h * 0.08, 30);
      moonGlow.addColorStop(0, 'rgba(180, 180, 220, 0.1)');
      moonGlow.addColorStop(1, 'rgba(180, 180, 220, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.08, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Church building
    var cx = w * 0.3, cy = h * 0.2, cw = w * 0.4, ch = h * 0.45;
    // Main building
    ctx.fillStyle = '#2a2040';
    ctx.fillRect(cx, cy + h * 0.1, cw, ch);
    // Roof (triangle)
    ctx.fillStyle = '#1a1530';
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.02, cy + h * 0.1);
    ctx.lineTo(cx + cw / 2, cy - h * 0.05);
    ctx.lineTo(cx + cw + w * 0.02, cy + h * 0.1);
    ctx.closePath();
    ctx.fill();
    // Cross
    ctx.strokeStyle = '#aaaacc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + cw / 2, cy - h * 0.05 - h * 0.06);
    ctx.lineTo(cx + cw / 2, cy - h * 0.05 + h * 0.02);
    ctx.moveTo(cx + cw / 2 - w * 0.02, cy - h * 0.05 - h * 0.02);
    ctx.lineTo(cx + cw / 2 + w * 0.02, cy - h * 0.05 - h * 0.02);
    ctx.stroke();
    // Door
    ctx.fillStyle = '#15102a';
    ctx.fillRect(cx + cw * 0.38, cy + ch * 0.55, cw * 0.24, ch * 0.45);
    // Door arch
    ctx.beginPath();
    ctx.arc(cx + cw * 0.5, cy + ch * 0.55, cw * 0.12, Math.PI, 0);
    ctx.fill();
    // Window (rose) — glows at evening
    var roseAlpha = isEvening ? 0.5 : 0.3;
    ctx.fillStyle = 'rgba(180, 160, 220, ' + roseAlpha + ')';
    ctx.beginPath();
    ctx.arc(cx + cw * 0.5, cy + ch * 0.25, cw * 0.08, 0, Math.PI * 2);
    ctx.fill();
    // Rose window glow at evening
    if (isEvening) {
      var roseGlow = ctx.createRadialGradient(cx + cw * 0.5, cy + ch * 0.25, 5, cx + cw * 0.5, cy + ch * 0.25, cw * 0.15);
      roseGlow.addColorStop(0, 'rgba(180, 160, 220, 0.15)');
      roseGlow.addColorStop(1, 'rgba(180, 160, 220, 0)');
      ctx.fillStyle = roseGlow;
      ctx.beginPath();
      ctx.arc(cx + cw * 0.5, cy + ch * 0.25, cw * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Side windows
    ctx.fillStyle = isEvening ? 'rgba(200, 180, 140, 0.3)' : 'rgba(160, 150, 200, 0.2)';
    ctx.fillRect(cx + cw * 0.1, cy + ch * 0.3, cw * 0.1, ch * 0.15);
    ctx.fillRect(cx + cw * 0.8, cy + ch * 0.3, cw * 0.1, ch * 0.15);

    // Steps
    ctx.fillStyle = '#3a3050';
    ctx.fillRect(cx + cw * 0.25, cy + ch + h * 0.1 - h * 0.05, cw * 0.5, h * 0.03);
    ctx.fillRect(cx + cw * 0.2, cy + ch + h * 0.1 - h * 0.02, cw * 0.6, h * 0.03);

    // Trees
    ctx.fillStyle = '#1a2a1a';
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 0.45, Math.max(1, w * 0.04), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(w * 0.12 - 3, h * 0.45, 6, h * 0.1);

    ctx.fillStyle = '#1a2a1a';
    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.42, Math.max(1, w * 0.035), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(w * 0.88 - 3, h * 0.42, 6, h * 0.1);

    // Cemetery stones (small)
    ctx.fillStyle = '#2a2a3a';
    var stones = [[0.15, 0.82], [0.22, 0.84], [0.78, 0.83], [0.85, 0.81]];
    for (var sti = 0; sti < stones.length; sti++) {
      ctx.fillRect(w * stones[sti][0], h * stones[sti][1], 6, 10);
      ctx.beginPath();
      ctx.arc(w * stones[sti][0] + 3, h * stones[sti][1], 3, Math.PI, 0);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = 'rgba(20, 15, 30, 0.8)';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  };

  /* -- Night Room -- */

  GameMap.prototype._renderNightRoom = function (ctx, w, h, period, weather) {
    // Background: very dark blue
    var bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a0a1a');
    bg.addColorStop(1, '#050510');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Window with moon
    var wx = w * 0.65, wy = h * 0.08, ww = w * 0.18, wh = h * 0.28;
    // Window
    ctx.fillStyle = '#0a0f2a';
    ctx.fillRect(wx, wy, ww, wh);
    // Moon
    ctx.fillStyle = 'rgba(220, 220, 240, 0.7)';
    ctx.beginPath();
    ctx.arc(wx + ww * 0.65, wy + wh * 0.3, Math.max(1, ww * 0.15), 0, Math.PI * 2);
    ctx.fill();
    // Moon glow
    var moonGlow = ctx.createRadialGradient(wx + ww * 0.65, wy + wh * 0.3, 5, wx + ww * 0.65, wy + wh * 0.3, ww * 0.4);
    moonGlow.addColorStop(0, 'rgba(180, 180, 220, 0.1)');
    moonGlow.addColorStop(1, 'rgba(180, 180, 220, 0)');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(wx + ww * 0.65, wy + wh * 0.3, ww * 0.4, 0, Math.PI * 2);
    ctx.fill();
    // Stars in window
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    var starPositions = [[0.2, 0.6], [0.4, 0.15], [0.8, 0.55], [0.3, 0.8], [0.7, 0.75]];
    for (var si = 0; si < starPositions.length; si++) {
      ctx.fillRect(wx + ww * starPositions[si][0], wy + wh * starPositions[si][1], 1.5, 1.5);
    }
    // Window frame
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 3;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath();
    ctx.moveTo(wx + ww / 2, wy);
    ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2);
    ctx.lineTo(wx + ww, wy + wh / 2);
    ctx.stroke();

    // Moonlight on floor
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#8888cc';
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.lineTo(wx + ww + w * 0.08, h * 0.85);
    ctx.lineTo(wx - w * 0.05, h * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Bed
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(w * 0.08, h * 0.62, w * 0.35, h * 0.14);
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(w * 0.08, h * 0.58, w * 0.1, h * 0.05);
    ctx.fillStyle = 'rgba(60, 60, 100, 0.4)';
    ctx.fillRect(w * 0.08, h * 0.66, w * 0.35, h * 0.06);

    // Desk
    ctx.fillStyle = '#1a1825';
    ctx.fillRect(w * 0.55, h * 0.52, w * 0.2, h * 0.08);
    // Desk legs
    ctx.fillRect(w * 0.56, h * 0.6, 4, h * 0.12);
    ctx.fillRect(w * 0.73, h * 0.6, 4, h * 0.12);

    // Desk lamp
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(w * 0.63, h * 0.44, 4, h * 0.08);
    // Lamp shade
    ctx.fillStyle = 'rgba(200, 180, 120, 0.3)';
    ctx.beginPath();
    ctx.moveTo(w * 0.61, h * 0.44);
    ctx.lineTo(w * 0.655, h * 0.38);
    ctx.lineTo(w * 0.68, h * 0.44);
    ctx.closePath();
    ctx.fill();
    // Lamp light glow — subtle pulse
    var lampPulse = 0.10 + Math.sin(this._animTime * 1.5) * 0.02;
    var lampGlow = ctx.createRadialGradient(w * 0.645, h * 0.44, 3, w * 0.645, h * 0.52, w * 0.08);
    lampGlow.addColorStop(0, 'rgba(200, 180, 120, ' + lampPulse + ')');
    lampGlow.addColorStop(1, 'rgba(200, 180, 120, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(w * 0.645, h * 0.52, w * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Book on desk
    ctx.fillStyle = '#2a2040';
    ctx.fillRect(w * 0.58, h * 0.50, w * 0.05, h * 0.02);
    ctx.fillStyle = '#3a3060';
    ctx.fillRect(w * 0.585, h * 0.498, w * 0.04, h * 0.003);

    // Phone on nightstand
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(w * 0.46, h * 0.65, w * 0.03, h * 0.04);
    ctx.fillStyle = 'rgba(100, 120, 180, 0.2)';
    ctx.fillRect(w * 0.463, h * 0.653, w * 0.024, h * 0.025);

    // Floor
    ctx.fillStyle = 'rgba(15, 15, 25, 0.8)';
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
  };

  window.GameMap = GameMap;
})();
