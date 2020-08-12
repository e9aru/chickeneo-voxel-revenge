/* jshint -W008 */

(function(game) {
  'use strict';

  function Gun(O) {
    // Add generated 3D model by Loader
    var gun = new THREE.Mesh(Gun.geometry, Gun.material, O);
    O = O || {};

    gun.key = 'gun';
    gun.gKey = 'interactable';
    gun.iText = 'Pickup gun';

    gun.material.opacity = 0;
    gun.material.transparent = true;

    gun.ammo = O.ammo || Gun.AMMO;
    gun.ammoMax = gun.ammo;
    gun.dmg = O.dmg || Gun.DMG;
    gun.reloadTime = O.reloadTime || Gun.RELOAD_TIME;
    gun.fireRate = O.fireRate || (6000 / Gun.FIRE_RATE);
    gun.recoil = Gun.RECOIL;
    gun.blowback = O.blowback || Gun.BLOWBACK;
    gun.range = O.range || Gun.RANGE;

    gun.soundShot = game.sound.gun.shot;
    gun.multishot = Gun.MULTISHOT;

    gun.reloading = false;
    gun._reloadStartedTime = 0;

    gun.isWeapon = true;
    gun.lastShotTime = 0;

    // Add lights
    gun.flash = new THREE.PointLight(game.COLORS[3], 0, 512);
    gun.add(gun.flash);


    // Add generated 3D model by Loader
    gun.main = Gun.voxel3DModel[THREE.Math.randInt(0, Gun.voxel3DModel.length - 1)].clone();
    gun.add(gun.main);

    // Bind
    for (var p in Gun.prototype) gun[p] = Gun.prototype[p];

    return gun;
  }

  Gun.prototype.reload = function()  { // exist for manual reloading
    console.debug('[Gun] reload');

    this.ammo = 0;
    this._reloadStartedTime = game.time.elapsedInGame;
    this.reloading = true;

    // Sound
    game.sound.gun.reload.play();
  };

  Gun.prototype.fire = function() {
    if (this.reloading) return;

    console.debug('[Gun] fire');
    this.ammo--;
    this.lastShotTime = game.time.elapsedInGame;

    // Blowback
    this.position.z = this._position.z - this.blowback;

    // Flash
    this.flash.intensity = 6;

    // Audio
    this.soundShot.play();

    // Create bullets
    for (var i = 0; i < this.multishot; i++) new game.Bullet(this);

    // Create shell
    new game.Shell(this.localToWorld(new THREE.Vector3(0, 0, 0)), this.localToWorld(new THREE.Vector3(256, 0, THREE.Math.randInt(-128, 128))));
  };

  Gun.prototype.spawn = function(x, z, y) {
    console.debug('[Gun] spawn ' + this.key);

    if (!game.Scene.current) console.die('[Gun] Need level to spawn');

    this.position.x = x || 0;
    this.position.y = y || 0;
    this.position.z = z || 0;

    this.rotation.y = Math.PI * .5;
    this.rotation.x = Math.PI * .5;

    game.Scene.current.level.add(this);
    game.Scene.current.add(this);

    return this;
  };

  Gun.prototype.onDrop = function() {
    this.spawn(this.owner.position.x, this.owner.position.z);
    this.owner.weapon = null;
    this.owner = null;
  };

  Gun.prototype.openPreview = function() {
    if (!this.owner || !this.owner.leashCamera) console.die('[Gun] Need owner with leash camera to preview');

    this.isPreviewed = true;
    this.owner.rotation.y = 0;
    this.owner.movable = false;

    // Slomo
    game.time.slomo = .02;

    // Take temporary from owner
    game.Scene.current.add(this);

    this.position.x = game.camera.position.x;
    this.position.z = game.camera.position.z + this.geometry.parameters.height * .65;
    this.position.y = game.camera.position.y - 24;

    this.rotateX(Math.PI);
  };

  Gun.prototype.closePreview = function() {
    if (!this.owner || !this.owner.leashCamera) console.die('[Gun] Need owner with leash camera to preview');

    this.rotation.z = 0;
    this.isPreviewed = false;
    this.owner.movable = true;

    // Slomo
    game.time.slomo = 1;

    // Give back to owner
    this.owner.add(this);

    this.position.set(this._position.x, this._position.y, this._position.z);
    this.rotation.x = this.rotation.y = this.rotation.z = 0;
  };

  Gun.prototype.updatePreviewed = function() {
    this.rotation.y += .01;
  };

  Gun.prototype.updateReload = function() {
    if (!this.ammo && !this.reloading) {
      this.reload();
      return;
    }

    if (this.reloading && game.time.elapsedInGame > this._reloadStartedTime + this.reloadTime) {
      this.reloading = false;
      this.ammo = this.ammoMax;
    }
  }

  // Manual update (only when equiped)
  Gun.prototype.updateEquiped = function() {
    // Blowback
    this.position.z += .4 * game.time.slomo;
    this.position.z = Math.min(this._position.z, this.position.z);

    // reload
    this.updateReload();
  };

  Gun.prototype.updatePickable = function() { };

  Gun.prototype.update = function() {
    if (this.isPreviewed) {
      this.updatePreviewed();
    } else {
      if (this.owner) {
        this.updateEquiped();
      } else {
        this.updatePickable();
      }

      // Flash
      this.flash.intensity -= .4 * game.time.slomo;
      this.flash.intensity = Math.max(0, this.flash.intensity);
    }
  };

  // Static stuff
  Gun.AMMO = 13;
  Gun.DMG = 40;
  Gun.RELOAD_TIME = 2000;
  Gun.FIRE_RATE = 0; // fire per minute 0 = no
  Gun.RECOIL = 0; // Add rotate to owner
  Gun.BLOWBACK = 8;
  Gun.MULTISHOT = 1;
  Gun.RANGE = 2; // basiclly it's Agent's max follow distance (tile = *Level.VOXSCALE) to player
  Gun.geometry = new THREE.BoxGeometry(24, 16, 4);
  Gun.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Gun = Gun;
}(game));