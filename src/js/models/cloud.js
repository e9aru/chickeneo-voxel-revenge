/* jshint -W008 */

(function(game) {
  'use strict';

  function Cloud(position) {
    var cloud = new game.Particle(
      position,
      new THREE.Euler(Math.random(), THREE.Math.randInt(0, 2) * Math.PI, 0),
      {
        color: 0xFFFFFF,
        speedMin: 4,
        speedMax: 6,
        size: THREE.Math.randInt(4, 12)
      }
    );

    cloud.key = 'cloud';
    cloud.material.transparent = true;

    // Old update
    cloud._update = cloud.update;

    // Bind
    for (var p in Cloud.prototype) cloud[p] = Cloud.prototype[p];

    return cloud;
  }

  Cloud.prototype.update = function() {
    this.position._y = this.position.y;
    this._update();
    this.position.y = this.position._y;

    this.material.opacity -= .04 * game.time.slomo;
    if (this.material.opacity <= 0) this.destroy();
  };


  game.Cloud = Cloud;
}(game));