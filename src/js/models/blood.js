/* jshint -W008 */
// Extends Particle

(function(game) {
  'use strict';

  function Blood(position, rotation, O) {
    if (!game.Particle) console.die('[Blood] game.Particle non exists, unable to extend!');

    O = O || {};
    O.color = O.color || Blood.COLOR;
    O.size = O.size || THREE.Math.randInt(Blood.SIZE_MIN, Blood.SIZE_MAX);


    var blood = new game.Particle(position, rotation, O);
    blood.key = 'blood';

    blood.material.shininess = 0;

    // Store parent update (for inherance behaviour)
    if (blood.update) blood._update = blood.update;

    // Bind
    for (var p in Blood.prototype) blood[p] = Blood.prototype[p];

    return blood;
  }

  Blood.prototype.update = function() {
    // Update from @Particle
    if (this._update) this._update();

    if (this.position.y <= this.geometry.parameters.height) {
      this._update = null;
    }
  };

  // Static stuff
  Blood.COLOR = game.COLORS[1];
  Blood.SIZE_MIN = 4;
  Blood.SIZE_MAX = 8;

  game.Blood = Blood;
}(game));