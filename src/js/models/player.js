/* jshint -W008 */
// Extends Human

(function(game) {
  'use strict';

  function Player() {
    if (!game.Human) console.die('[Player] game.Human non exists, unable to extend!');

    var player = new game.Human();
    player.key = 'player';

    player.energy = Player.ENERGY;
    player.energyMax = Player.ENERGY;

    // Change main model
    if (!Player.voxel3DModel) console.die('[Player] Missing voxel3DModel (generated by Loader)');
    player.remove(player.main);
    player.main = Player.voxel3DModel[THREE.Math.randInt(0, Player.voxel3DModel.length - 1)].clone();
    player.add(player.main);

    // Autopickup FIXME YAGNI Remove if not used (maybe for health ?)
    // player.autoPickup = new game.Collider(player, 64, this.pickup.bind(player), ['pickable'], true);

    // Inspect interactable (level.interactable)
    player.autoInspect = new game.Collider(player, 64, this.inspect.bind(player), ['interactable'], true);

    // Store parent functions (for inherance behaviour)
    if (player.update) player._update = player.update;
    if (player.pickup) player._pickup = player.pickup;

    // Aura
    player.aura = new THREE.PointLight(0xFFFFFF, .4, 512);
    player.aura.position.y = 1;
    player.add(player.aura);

    // Unique aimLine
    player.aimLine.material = player.aimLine.material.clone();
    player.aimLine.material.opacity = 1;
    player.aimLine.material.transparent = false;
    player.aimLine.material.depthWrite = true;

    // Bind
    for (var p in Player.prototype) player[p] = Player.prototype[p];

    return player;
  }

  Player.prototype.addCamera = function(camera) {
    console.debug('[Player] add leash camera');

    if (!camera) console.die('[Player] Need camera to leash');

    this.leashCamera = camera;
    this.leashCamera._offsetZ = Player.LEASH_CAMERA_OFFSET_Z;

    return this;
  };

  Player.prototype.removeCamera = function() {
    console.debug('[Player] remove leash camera');

    this.remove(this.leashCamera);
    this.leashCamera = null;

    return this;
  };

  Player.prototype.addController = function(controler) {
    console.debug('[Player] Add controller');

    if (!controler) console.die('[Player] Need controler to setup');

    controler.setup({
      W: {
        up: function() { this.moveUp = false },
        down: function() { this.moveUp = true }
      },
      S: {
        up: function() { this.moveDown = false },
        down: function() { this.moveDown = true }
      },
      A: {
        up: function() { this.moveLeft = false },
        down: function() { this.moveLeft = true }
      },
      D: {
        up: function() { this.moveRight = false },
        down: function() { this.moveRight = true }
      },
      R: {
        up: function() {},
        down: function() { if (this.weapon) this.weapon.reload() }
      },
      F: {
        up: function() {},
        down: function() { this.interact(this.inspected) }
      },
      SPACEBAR: {
        up: function() {},
        down: function() { this.dash() }
      },
      MOUSE: {
        up: function() {},
        down: function() {
          if (this.weapon && this.weapon.isPreviewed) {
            this.weapon.closePreview();
          } else {
            this.shoot();
          }
        },
        rmb: function() {
          game.time.slomo = game.time.slomo === 1 ? .3 : 1;

          // Sound
          if (game.time.slomo !== 1) {
            game.sound.player.slomo.play();
            game.hud.blink();
          }
        }
      }
    }, this);

    return this;
  };

  Player.prototype.pickup = function(item, openPreview) {
    this._pickup(item);

    // Preview open
    if (openPreview) item.openPreview();
  };

  Player.prototype.inspect = function(item) {
    // Already inspected
    if (item === this.inspected) return;

    console.debug('[Player] Inspected: ' + item.key);
    this.inspected = item;

    return this;
  };

  Player.prototype.interact = function(item) {
    if (!item) return;

    console.debug('[Player] Interact with: ' + item.key);

    // Its a gun!
    if (item.isWeapon) {
      this.pickup(item, true);
      return;
    }

    // Normal item
    if (item.onInteract) item.onInteract();
  };

  Player.prototype.regenerateEnergy = function() {
    if (game.time.elapsedInGame < this._lastRegen + Player.REGEN) return;

    this._lastRegen = game.time.elapsedInGame;
    this.energy = game.time.slomo === 1 ? Math.min(this.energy + 1, this.energyMax) : Math.max(this.energy - 23, 0);

    if (!this.energy) game.time.slomo = 1;
  };

  Player.prototype.updateRegeneration = function() { this.regenerateEnergy() };

  Player.prototype.updateLeashCamera = function() {
    if (this.leashCamera) {
      // Follow player
      this.leashCamera.position.x = this.position.x;
      this.leashCamera.position.z = this.position.z + this.leashCamera._offsetZ;

      // Zoom in if player is not moving
      // this.leashCamera.position.y = Math.max(
      //   Player.LEASH_CAMERA_DISTANCE,
      //   Player.LEASH_CAMERA_DISTANCE_FAR * (1 - (Math.max(Math.abs(this.velocity.x), Math.abs(this.velocity.z)) - game.Human.ACC_MIN) / game.Human.MS + game.Human.ACC_MIN)
      // );

      this.leashCamera.position.y = Player.LEASH_CAMERA_DISTANCE;

      this.leashCamera.lookAt(this.position);
      this.leashCamera.rotation.y -= game.mouse.x * .1;
      this.leashCamera.rotation.x += game.mouse.y * .1;
    }
  };

  Player.prototype.updateLookAtCursor = function() {
    if (!this.staringAt && game.mouse.position) this.stareAt(game.mouse);
  };

  Player.prototype.updateAutoPickup = function() { this.autoPickup.update() };

  Player.prototype.updateInspect = function() {
    this.autoInspect.update();

    this.inspected = this.autoInspect.collisionTarget;
  };

  Player.prototype.update = function() {
    // Movement, collition and rotation is updated @Human
    // Old update
    if (this._update) this._update();

    // Leash camera
    this.updateLeashCamera();

    if (!this.movable) return;

    // Look at cursor
    this.updateLookAtCursor();

    // Pickup items
    // this.updateAutoPickup(); // no more baby, this needs a player interact

    // Interaction
    this.updateInspect();

    this.updateRegeneration();
  };

  // Static stuff
  Player.ENERGY = 100;
  Player.REGEN = 200; // ms
  Player.LEASH_CAMERA_DISTANCE = 400;
  Player.LEASH_CAMERA_OFFSET_Z = 2;
  Player.LEASH_CAMERA_DISTANCE_FAR = 500; // It' will zoom out when player is not moving

  game.Player = Player;
}(game));