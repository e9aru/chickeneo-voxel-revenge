/* jshint -W008 */

(function(game) {
  'use strict';

  function Loader(assets, levelConstructor, sceneConstructor) {
    if (!assets) console.die('[Loader] You are trying to load nothing ..');
    if (!levelConstructor) console.die('[Loader] Missing level constructor');
    if (!sceneConstructor) console.die('[Loader] Missing scene constructor');

    this.preload = assets;
    this.toBeLoaded = 0;
    this.levelConstructor = levelConstructor;
    this.sceneConstructor = sceneConstructor;
    this.XHRLoader   = new THREE.XHRLoader();
    this.OBJLoader   = new THREE.OBJLoader();
    this.ImageLoader = new THREE.ImageLoader();
    this.FontLoader  = new THREE.FontLoader();
    this.AudioLoader = new THREE.AudioLoader();

    Loader.instances[Object.keys(Loader.instances).length] = this;

    return this;
  }

  Loader.prototype.onProgress = function() {};

  Loader.prototype.onLoad = function(key, callback, data) {
    console.debug('[Loader] Loaded: ' + key);

    this.toBeLoaded--;

    if (callback) callback.call(this, key, data);

    if (!this.toBeLoaded) {
      console.debug('[Loader] LOAD ALL COMPLETED');
      if (this.onComplete) this.onComplete();
    }
  };

  Loader.prototype.onError = function(key) { console.die('[Loader] Error loading: ' + key) };

  Loader.prototype.loadSoundsCallback = function(key, data) { game.sound.add(data.s, data.ss, data.url) };

  Loader.prototype.loadSounds = function() {
    console.debug('[Loader] Load all sounds');


    var audioChecker = new Audio();
    var type = audioChecker.canPlayType('audio/mpeg;') ? 'mp3' : 'ogg';
    var d;

    audioChecker = null;

    for (var p in this.preload.sounds) {
      d = {
        type: type,
        s: this.preload.sounds[p][0],
        ss: this.preload.sounds[p][1],
        url: '/assets/sounds/' + this.preload.sounds[p][2] + '.' + type
      };

      this.XHRLoader.load(
        d.url,
        this.onLoad.bind(this, this.preload.sounds[p][2], this.loadSoundsCallback, d),
        this.onProgress,
        this.onError
      );
    }

    d = type = null;
  };

  Loader.prototype.loadFontsCallback = function(key, data) {
    game.fonts[key] = data;

    if (!game.fonts.default) game.fonts.default = game.fonts[key];
  };

  Loader.prototype.loadFonts = function() {
    console.debug('[Loader] Load all fonts');

    for (var p in this.preload.fonts) this.FontLoader.load(
      '/assets/fonts/' + this.preload.fonts[p] + '.js',
      this.onLoad.bind(this, this.preload.fonts[p], this.loadFontsCallback),
      this.onProgress,
      this.onError
    );
  };

  Loader.prototype.loadLevelsCallback = function(key, data) {
    new this.sceneConstructor(key, new this.levelConstructor(key, JSON.parse(data)));
  };

  Loader.prototype.loadLevels = function() {
    console.debug('[Loader] Load all levels');
    if (!this.preload || !this.preload.levels) return;

    for (var p in this.preload.levels) this.XHRLoader.load(
      '/assets/levels/' + this.preload.levels[p] + '.json',
      this.onLoad.bind(this, this.preload.levels[p], this.loadLevelsCallback),
      this.onProgress,
      this.onError
    );
  };

  Loader.prototype.loadVoxelsCallback = function(key, obj3d) {
    // Try to bind voxel 3D Model to owner Constructor
    obj3d._constructorName = key.split('_')[0].slice(0, 1).toUpperCase() + key.split('_')[0].slice(1);
    if (!game[obj3d._constructorName]) console.die('[Loader] Cant find constructor for voxel: ' + obj3d._constructorName);

    // Load teture for voxel3DModel
    this.ImageLoader.load('/assets/voxels/' + key + '.png', this.onLoad.bind(this, key, function(key, img) {
      obj3d.traverse(function(o) {
        o.material = new THREE.MeshPhongMaterial();
        o.texture = new THREE.Texture(img);
        o.texture.needsUpdate = true;
        o.material.map = o.texture;
      });

      if (!game[obj3d._constructorName].voxel3DModel) game[obj3d._constructorName].voxel3DModel = [];
      game[obj3d._constructorName].voxel3DModel.push(obj3d);

    }), this.onProgress, this.onError);
  };

  Loader.prototype.loadVoxels = function() {
    console.debug('[Loader] Load all voxel modes');
    if (!this.preload || !this.preload.voxels) return;

    for (var p in this.preload.voxels) this.OBJLoader.load(
      '/assets/voxels/' + this.preload.voxels[p] + '.obj',
      this.onLoad.bind(this, this.preload.voxels[p], this.loadVoxelsCallback),
      this.onProgress,
      this.onError
    );
  };

  Loader.prototype.loadAll = function(callback) {
    console.debug('[Loader] LOAD ALL START');

    for (var i in this.preload) {
      for (var j = 0; j < this.preload[i].length; j++) {
        this.toBeLoaded++;

        // +1 for voxel texture
        if (i === 'voxels') this.toBeLoaded++;
      }
    }

    this.onComplete = callback;

    this.loadLevels();
    this.loadVoxels();
    this.loadFonts();
    this.loadSounds();

    return this;
  };

  // Static stuff
  Loader.instances = {};

  game.Loader = Loader;
}(game));