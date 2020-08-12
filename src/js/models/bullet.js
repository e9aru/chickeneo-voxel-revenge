/* jshint -W008 */

(function(game) {
  'use strict';

  function Bullet(weapon) {
    if (!weapon || !weapon.parent) console.die('[Bullet] Need weapon with owner (parent) to shoot');
    if (!game.Scene.current) console.die('[Bullet] Need level to spawn');

    var bullet = new THREE.Mesh(Bullet.geometry, Bullet.material);

    bullet.key = 'bullet';
    bullet.gKey = 'bullets';
    bullet.dmg = weapon.dmg;
    bullet.recoil = THREE.Math.randFloat(-weapon.recoil, weapon.recoil);


    // Bind
    for (var p in Bullet.prototype) bullet[p] = Bullet.prototype[p];

    // Need this for destroy
    bullet.distanceTraveled = 0;

    // Add collider
    bullet.collide = new game.Collider(bullet, Bullet.COLLISION_RANGE, function(target) {
      bullet.position.y = 0;

      if (target.damage) {
        // Custom damage
        target.damage({
          dmg: bullet.dmg,
          blowback: bullet.spawnPosition,
          position: bullet.position,
          rotation: bullet.rotation
        });

        // Sound
        game.sound.gun.damage.play();
      }

      bullet.destroy();
    }, ['humans', 'walls']);

    // Insta spawn
    var spawnPos = weapon.localToWorld(new THREE.Vector3(0, 0, weapon.geometry.parameters.width + 1));
    var lookAt = weapon.localToWorld(new THREE.Vector3(0, 0, weapon.geometry.parameters.width + 100));
    bullet.spawn(spawnPos, lookAt);

    return this;
  }

  Bullet.prototype.spawn = function(pos, lookAt) {
    console.debug('[Bullet] spawn ' + this.key);
    if (!game.Scene.current) console.die('[Bullet] Need level to spawn');

    // Position
    this.position.set(pos.x, pos.y, pos.z);
    this.lookAt(lookAt);

    // Recoil
    this.rotation.y += this.recoil;

    game.Scene.current.level.add(this);
    game.Scene.current.add(this);

    return this;
  };

  Bullet.prototype.destroy = function() {
    if (!game.Scene.current) return;
    console.debug('[Bullet] destroy');

    game.Scene.current.level.remove(this);
    game.Scene.current.remove(this);
  };

  Bullet.prototype.updateCollision = function() { this.collide.update() };

  Bullet.prototype.updatePosition = function() {
    this.distanceTraveled += (Bullet.SPEED * game.time.slomo);
    this.translateZ(Bullet.SPEED * game.time.slomo);
  };

  Bullet.prototype.update = function() {
    if (this.distanceTraveled >= Bullet.RANGE) this.destroy();

    this.updateCollision();
    this.updatePosition();
  };

  // Static stuff
  Bullet.SPEED = 32;
  Bullet.RANGE = 1024;
  Bullet.COLLISION_RANGE = 8;
  Bullet.geometry = new THREE.BoxGeometry(8, 8, 8);
  Bullet.material = new THREE.MeshPhongMaterial({ color: 0x000000 });

  game.Bullet = Bullet;
}(game));