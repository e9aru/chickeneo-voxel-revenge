/* jshint -W008 */

(function(game) {
  'use strict';

  function Table() {
    // Add generated 3D model by Loader
    var table = new THREE.Mesh(Table.geometry, Table.material);

    table.key = 'table';
    table.gKey = 'furnitures';

    // Add generated 3D model by Loader
    table.main = Table.voxel3DModel[THREE.Math.randInt(0, Table.voxel3DModel.length - 1)].clone();
    table.add(table.main);

    // Bind
    for (var p in table.prototype) table[p] = table.prototype[p];

    return table;
  }

  // Static stuff
  Table.geometry = new THREE.BoxGeometry(48, 48, 48);
  Table.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Table = Table;
}(game));