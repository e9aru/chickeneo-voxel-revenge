/* jshint -W008 */
// Extends Human

(function(game) {
  'use strict';

  function Agent() {
    if (!game.Human) console.die('[Agent] game.Human non exists, unable to extend!');
    var agent = new game.Human();

    agent.key = "agent";
    // Same gKey, and vox3dmodel

    // Store parent update (for inherance behaviour)
    if (agent.update) agent._update = agent.update;

    // Overwrite damage
    if (agent.damage) agent._damage = agent.damage;

    // EasyStar
    agent.es = new game.ES(agent, function(path) {
      agent.moveUp = agent.moveDown = agent.moveLeft = agent.moveRight = false;

      if (path && path.length < 1 + (agent.weapon && agent.weapon.range || 1)) return;

      agent.moveLeft  = agent.position.x > (path[1].x + 1) * game.Level.VOXSCALE * .5 - game.Level.VOXSCALE * .25;
      agent.moveRight = agent.position.x < (path[1].x + 1) * game.Level.VOXSCALE * .5 - game.Level.VOXSCALE * .25;
      agent.moveUp    = agent.position.z > path[1].y * game.Level.VOXSCALE * .5 + game.Level.VOXSCALE * .25;
      agent.moveDown  = agent.position.z < path[1].y * game.Level.VOXSCALE * .5 + game.Level.VOXSCALE * .25;

      // console.log('\n');
      // console.log(agent.position.x, path[1].x * game.Level.VOXSCALE * .5 - game.Level.VOXSCALE * .5);
      // console.log(agent.position.z, path[1].y * game.Level.VOXSCALE * .5 + game.Level.VOXSCALE * .5);
    });

    // Bind
    for (var p in Agent.prototype) agent[p] = Agent.prototype[p];

    // Give fine man a weapon
    agent.pickup(new game.Gun());

    // FIXME: make 2aimLine materials so it can be visible and not
    agent.aimLine.material.opacity = 0;

    // Register
    Agent.instances[agent.uuid] = agent;

    return agent;
  }

  Agent.prototype.damage = function(dmg) {
    if (this._damage) this._damage(dmg);

    // Freeze some frames
    // game.shaders.set('ae');
    game.time.freeze(2 /* , function() { game.shaders.set() } */);
  };

  Agent.prototype.attack = function(target) {
    if (!target) console.die('[Agent] Need target to attack');

    this.attacking = target;
    this.follow(target);
  };

  Agent.prototype.updateAttack = function() {
    if (!this.attacking || !this.attacking.alive) return;

    if (
      this.position.distanceTo(game.player.position) < this.weapon.range * game.Level.VOXSCALE * 1.6 &&
      game.time.elapsedInGame > this.weapon.lastShotTime + 600
      ) {
      this.stareAt(game.player);
      this.shoot();
    }
  };

  Agent.prototype.update = function() {
    // Old update
    if (this._update) this._update();

    // Prevent new update
    if (!this.alive) return;

    // update Attact
    this.updateAttack();

    // Start to follow player
    if (!game.player || !game.player.alive || this.following) return;
    // FIXME: Make Agent agression optionable
    if (this.position.distanceTo(game.player.position) <= (this.weapon && this.weapon.range * game.Level.VOXSCALE * 1.2 || game.Level.VOXSCALE)) this.attack(game.player);
  };

  game.Agent = Agent;

  // Static stuff
  Agent.RATE_OF_FIRE = 200;
  Agent.instances = {};
  Agent.instances.all = function() {
    return Object.keys(Agent.instances).map(function(a) {
      if (a !== 'all') return Agent.instances[a]
    }).filter(function(e) { return e });
  }
}(game));