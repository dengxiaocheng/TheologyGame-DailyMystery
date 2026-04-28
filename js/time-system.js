/**
 * TimeSystem — 游戏时间管理
 * 一天从 7:00 (420 分钟) 到 23:00 (1380 分钟)
 */
(function () {
  'use strict';

  function TimeSystem() {
    this.currentTime = 420; // 7:00 in minutes
    this.paused = false;
    this.rate = 1; // game-minutes per real second
    this.dayEnd = 1380; // 23:00
    this.dayStart = 420; // 7:00
  }

  TimeSystem.prototype.update = function (dt) {
    if (!this.paused) {
      this.currentTime += this.rate * dt;
      if (this.currentTime >= this.dayEnd) {
        this.currentTime = this.dayEnd;
      }
    }
  };

  TimeSystem.prototype.getDisplayTime = function () {
    var totalMinutes = Math.floor(this.currentTime);
    var hours = Math.floor(totalMinutes / 60);
    var minutes = totalMinutes % 60;
    return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
  };

  TimeSystem.prototype.getPeriod = function () {
    var t = this.currentTime;
    if (t < 540) return 'morning';         // 7:00–9:00
    if (t < 570) return 'commute';         // 9:00–9:30
    if (t < 720) return 'work';            // 9:30–12:00
    if (t < 810) return 'lunch';           // 12:00–13:30
    if (t < 1050) return 'afternoon';      // 13:30–17:30
    if (t < 1110) return 'commute-home';   // 17:30–18:30
    if (t < 1260) return 'evening';        // 18:30–21:00
    return 'night';                        // 21:00–23:00
  };

  TimeSystem.prototype.getMinutesElapsed = function () {
    return this.currentTime - this.dayStart;
  };

  TimeSystem.prototype.addMinutes = function (m) {
    this.currentTime += m;
    if (this.currentTime >= this.dayEnd) {
      this.currentTime = this.dayEnd;
    }
  };

  TimeSystem.prototype.isDayOver = function () {
    return this.currentTime >= this.dayEnd;
  };

  TimeSystem.prototype.pause = function () {
    this.paused = true;
  };

  TimeSystem.prototype.resume = function () {
    this.paused = false;
  };

  window.TimeSystem = TimeSystem;
})();
