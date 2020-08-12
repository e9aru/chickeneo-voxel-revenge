/* jshint -W008 */

/*
INFO::
* player should travel left -> right or down -> up


TODO::
* removing all things with Level.remove && Level.removeObject
* add credits page with or add this to game description: "Music: www.bensound.com"
* randomize enemy weapons
* environment props
* what about time delta in movement (https://www.airtightinteractive.com/2015/01/building-a-60fps-webgl-game-on-mobile/)


* change 'up' => 'front' and 'down' => 'back'
* http://threejs.org/examples/#webgl_effects_anaglyph
* add clear Level to wipe all things
*/

console.die = function(txt, lvl) { console[lvl || 'warn'](txt); return; };
// console.debug = function() {};

var game = {
  HEIGHT: window.innerHeight,
  WIDTH: window.innerWidth,
  AGENCY2: [ // MUST be power of 2
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0,
    0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0,
    0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0,
    0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ],
  AGENCY: [ // MUST be power of 2
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0,
    0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  ],
  COLORS: [
    0x1c3144, //0
    0xf9413e, //1
    0xf18f01, //2
    0xf5e2c8, //3
    0xa0b137, //4
    0x687508, //5
    0x333333, //6
    0x111111  //7
  ],
  fonts: {},  //This will be created by Loader with preload.fonts
  levels: ['test', 'liftroom', 'agency0', 'agency1', 'agency2'], // Order is important for Scene.next()
};

game.preload = {
  levels: game.levels,
  sounds: [
    ['liftroom', 'bgm', 'bensound-jazzcomedy-filter']
  ],
  voxels: [
    'liftroom',
    'human',
    'gun',
    'shotgun',
    'player',
    'elevator',
    'wall',
    'desk_0', 'desk_1',
    'table_0', 'table_1'
  ],
  fonts: ['bebas_regular']
};

(function(game) {
  'use strict';

  function init() {
    console.debug('!BOOT');

    // Aspect
    game.aspect = 4 / 3;

    // Hud
    game.hud = new game.Hud();

    // Sound
    game.sound = game.Sound.init();

    // Time
    game.time = {
      slomo: 1,
      start: Date.now(),
      then: Date.now(),
      now: 0,
      delta: 0,
      elapsed: 0,
      elapsedInGame: 0,
      frame: 0,
      interval: 1000 / 60, // 100ms / 60fps
      _freezeFrames: 0,
      _freezeAfter: [],
      freeze: function(frames, after) {
        game.time._freezeFrames = Math.max(game.time._freezeFrames, frames);
        if (after) game.time._freezeAfter.push(after);
      }
    };

    // Create camera (fieldOfView, aspectRatio, nearPlane, farPlane)
    game.camera = new THREE.PerspectiveCamera(60, game.WIDTH / game.HEIGHT, 1, 10000);
    game.camera.position.y = 1000;
    game.camera.rotateX(Math.PI * -.5);

    // Add mouse vector2 for aiming
    game.mouse = new THREE.Vector2();

    // game.camera.position.y = 10;
    // game.camera.rotateX(Math.PI * -.1);

    // Universal raycaster
    game.raycaster = new THREE.Raycaster();

    // Create renderer
    game.renderer = new THREE.WebGLRenderer({ antialias: true });
    game.renderer.setPixelRatio(window.devicePixelRatio);
    game.renderer.shadowMap.enabled = true; // Enable shadow renedering

    // Shaders
    game.shaders = {
      ae: new THREE.AnaglyphEffect(game.renderer),
      normal: game.renderer,
      set: function(s) {
        if (game.shaders.active === game.shaders[s]) return;

        game.shaders.active = (game.shaders[s] || game.shaders.normal);
        game.shaders.active.setSize(game.WIDTH, game.HEIGHT);
      }
    };
    game.shaders.active = game.shaders.normal;


    // Embed to DOM
    document.body.appendChild(game.renderer.domElement);

    // Add game controls
    game.controls = new game.Controls(window);

    // Refresh (update renderer size, aspectRadios, etc)
    onresize();

    // Create loader & load all stuff (loader will build Level and Scene instances)
    game.loader = new game.Loader(game.preload, game.Level, game.Scene).loadAll(function() {
      // Start scene (player spawn here)
      game.Scene.start('test');
      // game.Scene.start('agency2');

      // Add & adjust camera
      game.Scene.current.add(game.camera);
      game.camera.position.x = game.camera.position.x ? game.camera.position.x : game.Scene.current.level.width * .5;
      game.camera.position.z = game.camera.position.z ? game.camera.position.z : game.Scene.current.level.height * .5;
    });

    // Update
    render();
  }

  function render() {
    requestAnimationFrame(render);

    game.time.now = Date.now();
    game.time.delta = game.time.now - game.time.then;


    // scene & camera is ready, game unpoused, 60fps lock
    if (game.Scene.current && game.camera && game.time.delta > game.time.interval) {
      // Calculate time
      game.time.frame++;
      game.time.then = game.time.now - (game.time.delta % game.time.interval);
      game.time.elapsed += game.time.delta;
      game.time.elapsedInGame += game.time.delta * game.time.slomo;

      // Update mouse pointer
      if (game.mouse && game.camera) {
        game.raycaster.setFromCamera(game.mouse, game.camera);
        game.raycaster._intersected = game.raycaster.intersectObjects([game.Scene.current.level.floor]);

        if (game.raycaster._intersected && game.raycaster._intersected.length) game.mouse.position = game.raycaster._intersected[0].point;
      }

      // Freeze
      if (!game.paused) {
        // Update childs
        game.Scene.current.children.filter(function(c) { return c.update }).forEach(function(c) { c.update() });

        // Update hud layer
        game.hud.update();

        // Update render
        game.shaders.set(game.time.slomo !== 1 ? 'ae' : 'normal');

        // Render with shader wraper
        game.shaders.active.render(game.Scene.current, game.camera);
      } else {
        if (game.time._freezeFrames) game.time._freezeFrames--;
      }

      // After freeze
      if (game.time._freezeAfter.length) {
        game.time._freezeAfter.forEach(function(e) { e() });
        game.time._freezeAfter.length = 0;
      }

      game.paused = !!game.time._freezeFrames;
    }
  }

  function onresize() {
    console.debug('!WINDOW RESIZE');
    if (!game) return;

    // game.WIDTH = window.innerWidth;
    game.WIDTH = 640;
    game.HEIGHT = game.WIDTH / game.aspect;

    // game.camera._fov = (360 / Math.PI) * Math.atan(game.aspect * (game.HEIGHT / game.WIDTH)) * .6; // ~54
    game.camera._fov = 54;
    game.camera.fov = game.camera._fov;

    game.camera.updateProjectionMatrix();

    game.shaders.active.setSize(game.WIDTH, game.HEIGHT);
  }

  function oncontextmenu(e) { e.preventDefault() }

  function onmousemove(e) {
    if (!game || !game.mouse || !game.raycaster || !game.camera || !game.Scene.current) return;

    game.mouse.x =  (e.clientX / game.renderer.domElement.clientWidth)  * 2 - 1;
    game.mouse.y = -(e.clientY / game.renderer.domElement.clientHeight) * 2 + 1;
  }

  // Main window Events
  window.onload = init;
  window.onresize = onresize;
  window.oncontextmenu = oncontextmenu;
  window.onmousemove = onmousemove;
})(game);