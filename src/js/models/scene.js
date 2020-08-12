/* jshint -W008 */

(function(game) {
  'use strict';

  // @key - to be registered
  // @level - Level instance

  function Scene(key, level) {
    if (!key || !level) console.die('[Scene] Need key & level to create new Scene');

    var scene = new THREE.Scene();

    // Register
    if (Scene.instances[key]) console.die('[Scene] Scene already exists, key: ' + key);
    Scene.instances[key] = scene;

    scene.key = key;
    scene.level = level;

    return scene;
  }

  // Static stuff
  Scene.instances = {};
  Scene.current = null;
  Scene.hemisphere = new THREE.HemisphereLight(0xFFFFFF, 0x000000, .4);
  Scene.ambient = new THREE.AmbientLight(0x666666);
  Scene.sun = new THREE.DirectionalLight(0xFFFFFF, .6);
  Scene.fog = new THREE.Fog(0x000000, 180, 560);

  Scene.clear = function() {
    console.debug('[Scene] Cleaning last scene');

    if (!Scene.current) return;

    // Clear level (full dispose)
    Scene.current.level.clear();

    // Remove from scene
    for (var i = Scene.current.children.length - 1; i >= 0; i--) Scene.current.remove(Scene.current.children[i]);

    return Scene;
  };

  Scene.start = function(key, opts) {
    console.debug('[Scene] Starting scene: ' + key);

    if (!key || !Scene.instances[key]) console.die('[Scene] No key or missing scene, key: ' + key);

    Scene.clear();
    Scene.current = Scene.instances[key];

    // Build level and add to current scene
    // build() will generate collison groups ex. Scene.current.level.walls
    // addToScene() simply iterate each group and add its objects to scene
    Scene.current.level.build(opts).addToScene();

    // Add lights
    Scene.current.add(Scene.hemisphere);
    Scene.current.add(Scene.sun);
    Scene.current.add(Scene.ambient);

    // Add fog
    Scene.current.fog = Scene.fog;

    // Blink
    game.hud.blink();

    return Scene;
  };

  Scene.next = function() {
    if (!game.levels[game.levels.indexOf(Scene.current.key) + 1]) return;

    return Scene.clear().start('liftroom', { nextLevel: game.levels[game.levels.indexOf(Scene.current.key) + 1] });
  };

  Scene.restart = function() {
    return Scene.start(Scene.current.key);
  };

  game.Scene = Scene;
}(game));