/* jshint -W008 */

(function(game) {
  'use strict';

  function Level(key, json) {
    if (!key) console.die('[Level] Need key to create new Level');

    // Register
    if (Level.instances[key]) console.die('[Level] Level already exists, key: ' + key);
    Level.instances[key] = this;

    this.key = key;
    this.json = json;
    this.voxscale = Level.VOXSCALE;

    // Calculate sizes
    this.width = this.json.width * Level.VOXSCALE;
    this.height = this.json.height * Level.VOXSCALE;

    // Grab data
    this.data = this.json.layers[0].data;

    // Groups for faster collisions etc
    this.groups = ['particles', 'humans', 'bullets', 'walls', 'floors', 'furnitures',  'pickable', 'edges', 'interactable', 'texts', 'lamps', 'decals'];
    for (var g in this.groups) this[this.groups[g]] = [];

    return this;
  }

  Level.prototype.build = function(opts) {
    console.debug('[Level] Building level: ' + this.key);

    // Generate ES Grid
    this.grid = this.generateESGrid();

    // DEBUG: ESGrid
    // var x;
    // var xg = new THREE.BoxGeometry(Level.VOXSCALE * .5, Level.VOXSCALE * .5, Level.VOXSCALE * .5);
    // var col = [0xFFFFFF, 0xFFFF00, 0x00FF00, 0x0000FF];
    // var cd = 0xFF00FF;

    // this.grid.forEach(function(r, ri) {
    //   r.forEach(function(c, ci) {
    //     x = new THREE.Mesh(xg, new THREE.MeshBasicMaterial({ color: col[c] || cd, opacity: .5, transparent: true }));
    //     x.position.set(ci * Level.VOXSCALE * .5 + Level.VOXSCALE * .25, 10, ri * Level.VOXSCALE * .5 + Level.VOXSCALE * .25);

    //     game.Scene.current.add(x);
    //   });
    // });

    // Create floor
    this.createFloor();

    // Iterate json and crete all stuff
    this.data.map(function(t, i, T) {
      // Walls
      if (Level.WALL.indexOf(t) !== -1) this.createWall(i);

      // Lamps
      if (Level.LAMP.indexOf(t) !== -1) this.createLamp(i, t - Level.LAMP[0]);

      // Desks
      if (Level.DESK.indexOf(t) !== -1) this.createDesk(i, t - Level.DESK[0]);

      // Tables
      if (Level.TABLE.indexOf(t) !== -1) this.createTable(i, t - Level.TABLE[0]);

      // Entry
      if (Level.ENTRY.indexOf(t) !== -1) this.createEntry(i);

      // Exit
      if (Level.EXIT.indexOf(t) !== -1) this.createExit(i);

      // Enemy's
      if (Level.ENEMY.indexOf(t) !== -1) this.createEnemy(i);

      // Decals on empty spaces
      if (!t) this.createDecal(i);
    }, this);

    // Custom scripts
    // liftroom
    if (this.key === 'liftroom') new game.Liftroom(opts && opts.nextLevel);

    return this;
  };




  Level.prototype.generateESGrid = function() {
    // Generate ES grid
    var x, y, i;
    return new Array(this.json.height * 2).join(',').split(',').map(function(row, r) {
      return new Array(this.json.width * 2).join(',').split(',').map(function(cell, c) {
        y = ~~(r * .5);
        x = ~~(c * .5);
        i = (y * this.json.width) + x;

        // Half tile
        if ([]
          .concat(game.Level.halfFirst)
          .concat(game.Level.halfSecond)
          .concat(game.Level.halfThird)
          .concat(game.Level.halfFourth)
          .indexOf(this.data[i]) !== -1
        ) {
          if (game.Level.halfFirst.indexOf(this.data[i])  !== -1 && (r+1)%2) return this.data[i];
          if (game.Level.halfSecond.indexOf(this.data[i]) !== -1 &&  r%2) return this.data[i];
          if (game.Level.halfThird.indexOf(this.data[i])  !== -1 && (c+1)%2) return this.data[i];
          if (game.Level.halfFourth.indexOf(this.data[i])  !== -1 &&  c%2) return this.data[i];

          return 0;
        }

        // Quad size
        if ([]
          .concat(game.Level.quadFirst)
          .concat(game.Level.quadSecond)
          .concat(game.Level.quadThird)
          .concat(game.Level.quadFourth)
          .indexOf(this.data[i]) !== -1
        ) {
          if (game.Level.quadFirst.indexOf(this.data[i])  !== -1 && (r+1)%2 && (c+1)%2) return this.data[i];
          if (game.Level.quadSecond.indexOf(this.data[i]) !== -1 && (r+1)%2 &&  c%2) return this.data[i];
          if (game.Level.quadThird.indexOf(this.data[i])  !== -1 &&  r%2 && c%2) return this.data[i];
          if (game.Level.quadFourth.indexOf(this.data[i])  !== -1 &&  r%2 &&  (c+1)%2) return this.data[i];

          return 0;
        }

        // Full size
        return this.data[i];
      }, this);
    }, this);
  }

  Level.prototype.createFloor = function() {
    // Create raw floor texture data
    var floorTextureData = new Uint8Array(Level.VOXSCALE * Level.VOXSCALE);

    // Generate texture
    for (var i = 0; i < this.width * this.height; i++) {
      floorTextureData[i] = THREE.Math.randInt(240, 255);
    }

    // Create floor texture
    var floorTexture = new THREE.DataTexture(floorTextureData, this.json.width * 2, this.json.height * 2, THREE.LuminanceFormat, THREE.UnsignedByteType);
    floorTexture.needsUpdate = true;
    floorTexture.magFilter = THREE.NearestFilter;

    // Create floor material
    var floorMaterial = new THREE.MeshPhongMaterial({
      color: game.COLORS[0],
      alphaMap: floorTexture,
      transparent: true,
      shininess: 16
    });

    // Add floor
    this.floor = new THREE.Mesh(new THREE.BoxGeometry(this.width, 30, this.height), floorMaterial);
    this.floor.key = 'floor';
    this.floor.gKey = 'floors';

    this[this.floor.gKey].push(this.floor);

    // Move it to easly generate other stuff
    this.floor.position.x = this.floor.geometry.parameters.width  *  .5;
    this.floor.position.z = this.floor.geometry.parameters.depth  *  .5;
    this.floor.position.y = this.floor.geometry.parameters.height * -.5;

    this.floor.receiveShadow = true;
  };

  Level.prototype.createWall = function(i) {
    if (!game.Wall) console.die('[Level] Need Wall model to createWall');

    var nt = this.nearTile(i);
    var t = new game.Wall();

    this[t.gKey].push(t);

    t._position = this.createPoint(i);
    t.position.set(t._position.x, t._position.y, t._position.z);

    // Decorate some
    if (
      !nt.down &&
      i < (this.data.length - this.json.width) &&
      (!this._lastDecor || i > this._lastDecor + 1)
    ) {
      this._lastDecor = i;
      t.decorate();
    }

    return t;
  };

  Level.prototype.createLamp = function(i, type) {
    if (!game.Lamp) console.die('[Level] Need Lamp model to createWall');

    var t;

    if (type === 3) { //left
      t = new game.Lamp();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, this.voxscale, t._position.z);

      t.translateX(-this.voxscale * .5 + t.geometry.parameters.depth - 4);
      t.rotateY(Math.PI * -.5);
    } else if (type === 4) { //right
      t = new game.Lamp();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, this.voxscale, t._position.z);

      t.translateX(this.voxscale * .5 - t.geometry.parameters.depth + 4);
      t.rotateY(Math.PI * .5);
    } else if (type === 5) { //left&right
      this.createLamp(i, 3); //left
      this.createLamp(i, 4); //right
    } else if (type === 0) { //top
      t = new game.Lamp();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, this.voxscale, t._position.z);

      t.translateZ(-this.voxscale * .5 + t.geometry.parameters.depth - 4);
      t.rotateY(Math.PI * -1);
    } else if (type === 1) { //bottom
      t = new game.Lamp();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, this.voxscale, t._position.z);

      t.translateZ(this.voxscale * .5 - t.geometry.parameters.depth + 4);
    } else if (type === 2) { //top&bottom
      this.createLamp(i, 0); //top
      this.createLamp(i, 1); //bottom
    }

    if (!t) return;
    this[t.gKey].push(t);


    return t;
  };

  Level.prototype.createDesk = function(i, type) {
    // FIXME: Optimize createLamp/Desk/Table
    if (!game.Desk) console.die('[Level] Need Lamp model to createWall');

    var t;

    if (type === 2) { //left
      t = new game.Desk();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(-t.geometry.parameters.depth * .5);
      t.main.rotateY(Math.PI * -.5);

      // Rotate geometry couse of lazy collider system
      t.geometry = game.Desk.geometryRotated;
    } else if (type === 3) { //right
      t = new game.Desk();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(t.geometry.parameters.depth * .5);
      t.rotateY(Math.PI * .5);

      // Rotate geometry couse of lazy collider system
      t.geometry = game.Desk.geometryRotated;
    } else if (type === 0) { //top
      t = new game.Desk();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateZ(-t.geometry.parameters.depth * .5);
      t.rotateY(Math.PI * -1);
    } else if (type === 1) { //bottom
      t = new game.Desk();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateZ(t.geometry.parameters.depth * .5);
    }

    if (!t) return;
    this[t.gKey].push(t);


    return t;
  };

  Level.prototype.createTable = function(i, type) {
    // FIXME: Optimize createLamp/Desk/Table
    if (!game.Table) console.die('[Level] Need Lamp model to createWall');

    var t;

    if (type === 2) { //left
      t = new game.Table();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(t.geometry.parameters.depth * .5);
      t.translateZ(t.geometry.parameters.depth * .5);
      t.main.rotateY(Math.PI * -.5);

    } else if (type === 3) { //right
      t = new game.Table();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(-t.geometry.parameters.depth * .5);
      t.translateZ(t.geometry.parameters.depth * .5);
      t.rotateY(Math.PI * .5);

    } else if (type === 0) { //top
      t = new game.Table();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(-t.geometry.parameters.depth * .5);
      t.translateZ(-t.geometry.parameters.depth * .5);
      t.rotateY(Math.PI * -1);
    } else if (type === 1) { //bottom
      t = new game.Table();
      t._position = this.createPoint(i);
      t.position.set(t._position.x, 0, t._position.z);

      t.translateX(t.geometry.parameters.depth * .5);
      t.translateZ(-t.geometry.parameters.depth * .5);
    }

    if (!t) return;
    this[t.gKey].push(t);


    return t;
  };

  Level.prototype.createAgent = function(i) {
    if (!game.Agent) console.die('[Level] Need Agent model to createAgent');

    // Agent
    var t = new game.Agent();
    this[t.gKey].push(t);

    t._position = this.createPoint(i);
    t.position.set(t._position.x, t._position.y, t._position.z);

    // Run EasyStar
    t.es.init(
      this.grid,
      [0]
      .concat(Level.LAMP)
      .concat(Level.ENTRY)
      .concat(Level.EXIT)
      .concat(Level.ENEMY)
    );

    return t;
  };

  Level.prototype.createEnemy = Level.prototype.createAgent;

  Level.prototype.createExit = function(i) {
    this.exit = new game.Exit();
    this.exit._position = this.createPoint(i);
    this.exit.position.set(this.exit._position.x, this.exit._position.y, this.exit._position.z);

    this.exit._position = this.createPoint(i);
    this.exit.position.set(this.exit._position.x, this.exit._position.y, this.exit._position.z);

    this[this.exit.gKey].push(this.exit);

    return this.exit;
  };

  Level.prototype.createEntry = function(i) {
    this.entry = new THREE.Object3D();
    this.entry._position = this.createPoint(i);
    this.entry.position.set(this.entry._position.x, this.entry._position.y, this.entry._position.z);

    // Make it global
    game.entry = this.entry;

    // Spawn player
    game.player = new game.Player().addController(game.controls).addCamera(game.camera);
    game.player.spawn(this.entry.position.x, this.entry.position.z, this.entry.position.y).addCamera(game.camera).pickup(new game.Shotgun());

    game.Scene.current.add(this.entry);

    return this.entry;
  };

  Level.prototype.createDecal = function(i) { };

  Level.prototype.createPoint = function(i) {
    return new THREE.Vector3(
      this.voxscale * (i % this.json.width) + this.voxscale * .5,
      0,
      this.voxscale * Math.floor(i / this.json.width) + this.voxscale * .5
    );
  };

  Level.prototype.nearTile = function(i) {
    return {
      up:    this.data[i - this.json.width],
      down:  this.data[i + this.json.width],
      left:  i % this.json.width ? this.data[i - 1] : null,
      right: (i + 1) % this.json.width ? this.data[i + 1] : null
    };
  }

  Level.prototype.tile2Point = function(i, isHalf) {
    if (i.x && i.y) {
      return {
        x: i.x * this.voxscale * (isHalf ? .5 : 1),
        y: i.y * this.voxscale * (isHalf ? .5 : 1)
      };
    } else {
      return this.createPoint(i);
    }
  };

  Level.prototype.point2Tile = function(v3, isHalf) {
    return {
      x: ~~(v3.x / this.voxscale / (isHalf ? .5 : 1)),
      y: ~~(v3.z / this.voxscale / (isHalf ? .5 : 1))
    };
  };

  Level.prototype.remove = function(obj) {
    if (!obj || !obj.gKey) console.die('[Level] Need object with gKey to remove');

    this[obj.gKey].splice(this[obj.gKey].map(function(b) { return b.id }).indexOf(obj.id), 1);
  };

  Level.prototype.add = function(obj) {
    if (!obj || !obj.gKey) console.die('[Level] Need object with gKey to add');

    this[obj.gKey].push(obj);
  };

  Level.prototype.addToScene = function() {
    if (!game.Scene.current) console.die('[Level] Need current scenne to add objects');

    for (var g in this.groups) for (var o in this[this.groups[g]]) game.Scene.current.add(this[this.groups[g]][o]);
  }

  Level.prototype.removeObjectNodes = function(node) {
    if (node instanceof THREE.Mesh) {
      if (node.geometry) node.geometry.dispose();

      if (node.material) {
        if (node.material instanceof THREE.MeshFaceMaterial) {
          node.material.materials.forEach(function(mtrl, idx) {
            if (mtrl.map)           mtrl.map.dispose();
            if (mtrl.lightMap)      mtrl.lightMap.dispose();
            if (mtrl.bumpMap)       mtrl.bumpMap.dispose();
            if (mtrl.normalMap)     mtrl.normalMap.dispose();
            if (mtrl.specularMap)   mtrl.specularMap.dispose();
            if (mtrl.envMap)        mtrl.envMap.dispose();

            mtrl.dispose();    // disposes any programs associated with the material
          });
        } else {
          if (node.material.map)          node.material.map.dispose();
          if (node.material.lightMap)     node.material.lightMap.dispose();
          if (node.material.bumpMap)      node.material.bumpMap.dispose();
          if (node.material.normalMap)    node.material.normalMap.dispose();
          if (node.material.specularMap)  node.material.specularMap.dispose();
          if (node.material.envMap)       node.material.envMap.dispose();

          node.material.dispose();   // disposes any programs associated with the material
        }
      }
    }
  };   // disposeNode

  Level.prototype.removeObject = function(node) {
    for (var i = node.children.length - 1; i >= 0; i--) {
      this.removeObjectNodes(node.children[i]);
    }

    this.removeObjectNodes(node);

    return this;
  };

  Level.prototype.clear = function() {
    for (var g in this.groups) for (var o in this[this.groups[g]]) {
      this.removeObject(this[this.groups[g]][o]);
      this.remove(this[this.groups[g]][o]);
    }
  };

  // Static stuff
  Level.WALL  = [1];
  Level.ENTRY = [2];
  Level.EXIT  = [3];
  Level.ENEMY = [4];
  Level.LAMP  = [5, 6, 7, 8, 9, 10];
  Level.DESK  = [11, 12, 13 ,14]; // .5 field size
  Level.TABLE = [15 ,16 ,17 ,18]; // .25 field size
  Level.VOXSCALE = 96;

  // 1/4 tile: topLeft = first, topRight = second, botRight = third, botLeft = fourth
  Level.quadFirst  = [15];
  Level.quadSecond = [16];
  Level.quadThird  = [17];
  Level.quadFourth = [18];

  // 1/2 tile: top = first, bot = second, left = third, right = fourth
  Level.halfFirst  = [5, 11];
  Level.halfSecond = [6, 12];
  Level.halfThird  = [7, 13];
  Level.halfFourth = [8, 14];

  Level.next = function() {
    if (Level.current) Level.current
  };

  Level.instances = {};
  Level.geometry = {
    wall: new THREE.BoxGeometry(Level.VOXSCALE, Level.VOXSCALE, Level.VOXSCALE)
  };

  game.Level = Level;
})(game);