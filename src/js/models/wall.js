/* jshint -W008 */

(function(game) {
  'use strict';

  function Wall() {

    var wall = new THREE.Mesh(Wall.geometry, Wall.material);

    wall.key = 'wall';
    wall.gKey = 'walls';

    wall.material.opacity = 0;
    wall.material.transparent = true;

    // Add generated 3D model by Loader
    wall.main = game.Wall.voxel3DModel[THREE.Math.randInt(0, Wall.voxel3DModel.length - 1)].clone();
    wall.main.children[0].material.shininess = 48;
    wall.add(wall.main);

    // Create small roof on top
    wall.roof = new THREE.Mesh(
      new THREE.BoxGeometry(game.Level.VOXSCALE, game.Level.VOXSCALE * 2, game.Level.VOXSCALE),
      new THREE.MeshPhongMaterial({ color: game.COLORS[0], shininess: 30 })
    );
    wall.roof.translateY(game.Level.VOXSCALE * 2);
    wall.add(wall.roof);

    // Bind
    for (var p in Wall.prototype) wall[p] = Wall.prototype[p];

    return wall;
  }

  Wall.prototype.damage = function(dmg) {
    console.debug('[Wall] Damage');

    for (var i = 0; i < 4; i++) {
      new game.Blood(dmg.position, dmg.rotation, { color: game.COLORS[0] }).rotation.y -= Math.PI;
    }
  };

  Wall.prototype.decorate = function() {
    console.debug('[Wall] Decorate');

    // Create raw texture data
    var textureData = new Uint8Array(Math.pow(game.AGENCY.length, 2));

    // Generate texture
    for (var i = 0; i < game.AGENCY.length; i++) {
      textureData[i] = game.AGENCY[i] ? 100 : 200;
    }

    // Create texture
    var texture = new THREE.DataTexture(textureData, Math.sqrt(game.AGENCY.length), Math.sqrt(game.AGENCY.length), THREE.LuminanceFormat, THREE.UnsignedByteType);
    texture.needsUpdate = true;
    texture.magFilter = THREE.NearestFilter;

    var banner = new THREE.Mesh(
      new THREE.BoxGeometry(game.Level.VOXSCALE, game.Level.VOXSCALE, 4),
      new THREE.MeshPhongMaterial({ color: game.COLORS[0] })
    );
    banner.translateZ(game.Level.VOXSCALE * .5 + banner.geometry.parameters.depth * .5);
    banner.translateY(game.Level.VOXSCALE * .5 + 32);

    var bannerLogo = new THREE.Mesh(
      new THREE.BoxGeometry(game.Level.VOXSCALE * .8, game.Level.VOXSCALE, 1),
      new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        alphaMap: texture,
        transparent: true,
        shininess: 2
      })
    );
    bannerLogo.translateZ(banner.geometry.parameters.depth);
    bannerLogo.rotateX(Math.PI);

    banner.add(bannerLogo);

    // Add to wall
    this.add(banner);
  };

  // Static stuff
  Wall.geometry = new THREE.BoxGeometry(game.Level.VOXSCALE, game.Level.VOXSCALE, game.Level.VOXSCALE);
  Wall.material = new THREE.MeshPhongMaterial({ depthWrite: false, transparent: true, opacity: 0 });

  game.Wall = Wall;
}(game));