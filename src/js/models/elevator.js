/* jshint -W008 */

(function(game) {
  'use strict';

  function Elevator() {
    // Add generated 3D model by Loader
    var elevator = new THREE.Mesh(Elevator.geometry, Elevator.material);

    elevator.key = 'elevator';
    elevator.gKey = 'interactable';
    elevator.iText = 'Call elevator - next level';

    // Add generated 3D model by Loader
    elevator.main = Elevator.voxel3DModel[THREE.Math.randInt(0, Elevator.voxel3DModel.length - 1)].clone();
    elevator.main.translateZ(-game.Level.VOXSCALE * .5 + elevator.geometry.parameters.depth * .5);
    elevator.add(elevator.main);

    // Add lights
    elevator.lights = [];
    for (var i = 0; i < 2; i++) {
      elevator.lights[i] = new THREE.PointLight(game.COLORS[4], 3, 64);
      elevator.lights[i].position.y = !i ? 48 : 32;
      elevator.lights[i].position.x = !i ? 0  : 16;
      elevator.lights[i].position.z = -32;
      elevator.add(elevator.lights[i]);
    }

    // Bind
    for (var p in Elevator.prototype) elevator[p] = Elevator.prototype[p];

    return elevator;
  }

  Elevator.prototype.onInteract = function() {
    console.debug('[Elevator] On interact');
    game.Scene.next();
  };

  // Static stuff
  Elevator.geometry = new THREE.BoxGeometry(64, 64, 16);
  Elevator.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Exit = game.Elevator = Elevator;
}(game));