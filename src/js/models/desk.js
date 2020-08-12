/* jshint -W008 */

(function(game) {
  'use strict';

  function Desk() {
    // Add generated 3D model by Loader
    var desk = new THREE.Mesh(Desk.geometry, Desk.material);

    desk.key = 'desk';
    desk.gKey = 'furnitures';

    // Add generated 3D model by Loader
    desk.main = Desk.voxel3DModel[THREE.Math.randInt(0, Desk.voxel3DModel.length - 1)].clone();
    desk.add(desk.main);

    // Bind
    for (var p in desk.prototype) desk[p] = desk.prototype[p];

    return desk;
  }

  // Static stuff
  Desk.geometry = new THREE.BoxGeometry(96, 48, 48);
  Desk.geometryRotated = new THREE.BoxGeometry(48, 48, 96);
  Desk.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Desk = Desk;
}(game));