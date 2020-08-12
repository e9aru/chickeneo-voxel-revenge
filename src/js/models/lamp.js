/* jshint -W008 */
// Limit to max 8 dynamic lights

(function(game) {
  'use strict';

  function Lamp(O) {
    O = O || {};

    var lamp = new THREE.Mesh(Lamp.geometry, Lamp.material);
    lamp.key = 'lamp';
    lamp.gKey = 'lamps';

    lamp.color = O.color || Lamp.COLOR;

    lamp.material.setValues({ color: lamp.color });
    lamp.castShadow = true;
    lamp.receiveShadow = true;
    lamp.side = new THREE.Vector3(0, 1, 0);

    // Bind
    for (var p in Lamp.prototype) lamp[p] = Lamp.prototype[p];

    // Cook lights (it's heavy in realtime)
    if (Lamp.lights.length < Lamp.LIGHTS_LIMIT) lamp.attachLight(lamp.light = Lamp.createLight());

    return lamp;
  }

  Lamp.prototype.attachLight = function() {
    // Unregister from previous parent
    if (this.light.parent) this.light.parent.light = null;

    // Customize
    this.light.color.set(this.color);
    this.light.position.y = -this.geometry.parameters.height * .25;

    this.add(this.light);
    this.add(this.light.target);

    return this;
  };

  Lamp.prototype.moveLight = function() {
    this.light = Lamp.lights.splice(0, 1)[0];
    Lamp.lights.push(this.light);

    this.attachLight(this.light);

    return this.light;
  };

  Lamp.prototype.update = function() {
    if (!game.player) return;
    if (this.position.distanceTo(game.player.position) > Lamp.LIGHTUP_RANGE || this.light) return;

    this.moveLight();
  };

  // Static stuff
  Lamp.COLOR = game.COLORS[6];
  Lamp.LIGHTS_LIMIT = 6;
  Lamp.LIGHTUP_RANGE = 480;

  Lamp.lights = [];

  Lamp.geometry = new THREE.BoxGeometry(game.Level.VOXSCALE, game.Level.VOXSCALE * .1, game.Level.VOXSCALE * .1);
  Lamp.material = new THREE.MeshPhongMaterial({ transparent: true });

  Lamp.createLight = function() {
    console.debug('[Lamp] Create new light');

    var light = new THREE.SpotLight(Lamp.COLOR, 32, 256, 1.1, .2, .6);

    light.castShadow = true;

    light.target.translateY(-18);
    light.target.translateZ(-8);

    light.shadow.mapSize.width = 256;
    light.shadow.mapSize.height = 256;
    light.shadow.camera.near = 8;
    light.shadow.camera.far = 32;
    light.shadow.fov = 0;

    // Static register instance
    Lamp.lights.push(light);
    game.Scene.current.add(light);

    return light;
  }

  game.Lamp = Lamp;
}(game));