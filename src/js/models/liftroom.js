/* jshint -W008 */

(function(game) {
  'use strict';

  function Liftroom(lvl) {
    if (!lvl) console.die('[Liftroom] need lvl to construct');

    // Add generated 3D model by Loader
    var liftroom = new THREE.Mesh(Liftroom.geometry, Liftroom.material);

    liftroom.key = 'Liftroom';
    liftroom.gKey = 'interactable';
    liftroom.iText = 'wait ..';
    liftroom._created = game.time.now;
    liftroom.nextLvl = lvl;

    liftroom.position.set(game.Level.VOXSCALE * .5, 0, game.Level.VOXSCALE * .5);

    // Add generated 3D model by Loader
    liftroom.main = Liftroom.voxel3DModel[THREE.Math.randInt(0, Liftroom.voxel3DModel.length - 1)].clone();
    // liftroom.main.translateZ(-game.Level.VOXSCALE * .5 + Liftroom.geometry.parameters.depth * .5);
    liftroom.add(liftroom.main);

    // Add lights
    liftroom.light = new THREE.PointLight(game.COLORS[0], 9, 96);
    liftroom.light.position.y = 48;
    // liftroom.light.position.x = 48;
    liftroom.light.position.z = 48;
    liftroom.add(liftroom.light);

    // Add lamp
    liftroom.lamp = new game.Lamp();
    liftroom.lamp.position.set(48, 48, 160);
    game.Scene.current.add(liftroom.lamp);

    // Remove floor
    game.Scene.current.level.remove(game.Scene.current.level.floor);
    // game.Scene.current.remove(game.Scene.current.level.floor);

    // Floor
    // liftroom.floor = new THREE.Mesh(new THREE.BoxGeometry(96, 1, 96));
    // liftroom.floor.receiveShadow = true;
    // liftroom.floor.castShadow = true;
    // liftroom.floor.translateY(1.6);
    // liftroom.add(liftroom.floor);

    // Bind
    for (var p in Liftroom.prototype) liftroom[p] = Liftroom.prototype[p];

    game.Scene.current.level.add(liftroom);

    game.controls.active = false;
    game.player.movable = false;
    game.player.removeCamera();
    game.camera.fov = 90;
    game.camera.updateProjectionMatrix();
    game.camera.position.set(48, 48, 150);
    game.camera.rotation.x = game.camera.rotation.y = game.camera.rotation.z = 0;
    // game.camera.rotateY(Math.PI);
    // game.camera.rotateZ(Math.PI * .5);

    // Play sound
    game.sound.liftroom.bgm.play();

    return liftroom;
  }

  Liftroom.prototype.update = function() {
    this.lamp.rotateX(-.06);
    this.lamp.light.angle = 1.4;
    this.lamp.light.intensity = 12;
    game.camera.rotation.y = -game.mouse.x * .1;
    game.camera.rotation.x =  game.mouse.y * .1;

    if (this._created > game.time.now - Liftroom.DURATION) return;

    var self = this;

    this.update = null;
    game.sound.liftroom.bgm.pause();
    game.sound.liftroom.bell.play(function() {
      game.controls.active = true;
      game.player.movable = true;
      game.camera.fov = game.camera._fov;
      game.camera.updateProjectionMatrix();
      game.Scene.start(self.nextLvl);

      self = null;
    });
  };

  // Static stuff
  Liftroom.DURATION = 6400;

  Liftroom.geometry = new THREE.BoxGeometry(96, 96, 96);
  Liftroom.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Liftroom = Liftroom;
}(game));