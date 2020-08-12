/* jshint -W008 */

(function(game) {
  'use strict';

  function Particle(position, rotation, O) {
    if (!position || !rotation) console.die('[Particle] Need position and rotation to construct');
    O = O || {};

    var particle = new THREE.Mesh(new THREE.BoxGeometry(O.size || Particle.SIZE, O.size || Particle.SIZE, O.size || Particle.SIZE), new THREE.MeshPhongMaterial({ color: O.color || game.COLORS[7] }));

    particle.key = 'particle';
    particle.gKey = 'particles';
    particle.age = 0;

    particle.position.x = position.x;
    particle.position.z = position.z;
    particle.position.y = position.y;

    particle.rotation.x = rotation.x;
    particle.rotation.y = Math.PI + rotation.y;
    particle.rotation.z = rotation.z;

    particle.speed = THREE.Math.randInt(O.speedMin || Particle.SPEED_MIN, O.speedMax || Particle.SPEED_MAX);
    particle._speed = particle.speed;

    particle.rotation.x += THREE.Math.randFloat(-.5, .5);
    particle.rotation.y += THREE.Math.randFloat(-.5, .5);
    particle.rotation.z += THREE.Math.randFloat(-.5, .5);

    // Bind
    for (var p in Particle.prototype) particle[p] = Particle.prototype[p];

    // Insta spawn
    particle.spawn(position.x, position.z, Particle.OFFSET_Y);

    return particle;
  }

  Particle.prototype.update = function() {
    if (++this.age >= this.lifespan) {
      this.destroy();
      return;
    }

    this._speed -= (this.speed * .04 * game.time.slomo);

    this.translateZ(-this._speed * game.time.slomo);
    this.position.y -= (3 * game.time.slomo);
  };

  Particle.prototype.spawn = function(x, z, y) {
    console.debug('[Particle] spawn ' + this.key);

    if (!game.Scene.current) console.die('[Particle] Need level to spawn');

    this.position.x = x || 0;
    this.position.z = z || 0;
    this.position.y = y || 0;

    game.Scene.current.level.add(this);
    game.Scene.current.add(this);

    // Handle limit
    if (game.Scene.current.level.particles.length > Particle.LIMIT) game.Scene.current.level.particles[0].destroy();

    return this;
  };

  Particle.prototype.destroy = function() {
    if (!game.Scene.current) return;
    console.debug('[Particle] destroy');

    game.Scene.current.level.remove(this);
    game.Scene.current.remove(this);
  };

  // Static stuff
  Particle.OFFSET_Y = 64;
  Particle.LIFE_SPAN = 72;
  Particle.SPEED_MIN = 8;
  Particle.SPEED_MAX = 12;
  Particle.SIZE = 8;
  Particle.LIMIT = 256;

  game.Particle = Particle;
}(game));