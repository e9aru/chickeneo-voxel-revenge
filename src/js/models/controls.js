/* jshint -W008 */

(function(game) {
  'use strict';

  function Controls(W) {
    if (!W) console.die('[Controls] Need window to bind controls');

    var self = this;
    this.active = true;

    W.onkeydown = function(e) { if (Controls[e.keyCode]) self.run(Controls[e.keyCode].down) };
    W.onkeyup = function(e) { if (Controls[e.keyCode]) self.run(Controls[e.keyCode].up) };

    W.onmousedown =   function(e) { if (e.button !== 0) return; self.run(Controls.MOUSE.down, e); };
    W.onmouseup =     function(e) { if (e.button !== 0) return; self.run(Controls.MOUSE.up, e); };
    W.oncontextmenu = function(e) { self.run(Controls.MOUSE.rmb, e) };

    return this;
  }

  Controls.prototype.setup = function(O, caller) {
    console.debug('[Controls] Setup controls');

    if (typeof O !== 'object') console.die('[Controls] Need controlmap object to setup controls');

    for (var o in O) if (Controls[o]) {
      if (O[o].move) Controls[o].move = O[o].move.bind(caller);
      if (O[o].down) Controls[o].down = O[o].down.bind(caller);
      if (O[o].rmb)  Controls[o].rmb = O[o].rmb.bind(caller);
      if (O[o].up)   Controls[o].up = O[o].up.bind(caller);
    }

    return this;
  };

  Controls.prototype.run = function(fn, e) {
    if (!this.active) return;
    if (e) e.preventDefault();
    if (fn && typeof fn === 'function') fn(e);

    return this;
  };

  // Static stuff
  Controls.MOUSE = {};
  Controls.A = {};
  Controls.S = {};
  Controls.D = {};
  Controls.W = {};
  Controls.R = {};
  Controls.F = {};
  Controls.SPACEBAR = {};

  Controls[87] = Controls.W;
  Controls[65] = Controls.A;
  Controls[83] = Controls.S;
  Controls[68] = Controls.D;
  Controls[82] = Controls.R;
  Controls[70] = Controls.F;
  Controls[32] = Controls.SPACEBAR;

  game.Controls = Controls;
}(game));