/* jshint -W008 */

(function(game) {
  'use strict';

  function Hud() {
    this.element = document.getElementById(Hud.SELECTOR_ID);

    if (!this.element) console.die('[Hud] Missing hud element in DOM' + Hud.SELECTOR_ID);

    // Create all hud's objects
    Hud.ELEMENTS.forEach(function(e) {
      this[e] = {};
      this[e].element = document.getElementById(Hud.SELECTOR_ID + '-' + e);

      if (!this[e].element) if (this.element) console.die('[Hud] Missing hud element in DOM: ' + e);

      this[e].set = Hud.setText.bind(this[e]);
      this[e].clear = Hud.setText.bind(this[e], '');
    }, this);

    // Bind
    for (var p in Hud.prototype) this[p] = Hud.prototype[p];

    return this;
  }

  Hud.prototype.update = function() {
    if (!game.player) return;

    // health
    if (game.player.hp !== this.health.value) this.health.set(game.player.hp || "RIP");

    // inspected
    if (game.player.inspected) {
      this.inspect.set(game.player.inspected.iText ? game.player.inspected.iText : 'Use ' + game.player.inspected.key);
    } else {
      this.inspect.set();
    }

    // ammo
    if (game.player.weapon && (game.player.weapon.ammo !== this.ammo.value)) this.ammo.set(game.player.weapon.ammo || "Reloading ..");

    // energy
    if (game.player.energy !== this.energy.value) this.energy.set(game.player.energy || "0");

    return this;
  };

  Hud.prototype.blink = function() {
    var e = this.element;
    e.className = '';

    game.time.freeze(1, function() {
      e.className = 'blink';
      e = null;
    });
  };

  // Static stuff
  Hud.ELEMENTS = ['health', 'ammo', 'action', 'main', 'inspect', 'energy'];
  Hud.SELECTOR_ID = 'hud';
  Hud.setText = function(val, type) {
    this.value = val || '';
    this.element.innerHTML = this.value;

    if (type) {
      this.element.className = type === 1 ? 'positive' : 'negative';
    } else {
      this.element.className = '';
    }
  };

  game.Hud = Hud;
}(game));