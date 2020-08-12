/* jshint -W008 */
// Extends Particle

(function(game) {
  'use strict';

  function Shell(posShell, posShellLook, O) {
    if (!game.Particle) console.die('[Shell] game.Particle non exists, unable to extend!');
    if (!posShell || !posShellLook) console.die('[Shell] need posShell & posShellLook to construct');

    O = O || {};
    O.color = Shell.COLOR;
    O.size = Shell.SIZE;
    O.speedMin = Shell.SPEED_MIN;
    O.speedMax = Shell.SPEED_MAX;

    var shell = new game.Particle(
      posShell,
      {x: 0, y:0, z: 0},
      O
    );
    shell.key = 'shell';

    // It's insta spawned as particle, make proper rotation here
    shell.lookAt(posShellLook);

    // Move right a bit
    shell.translateZ(-4);

    // Store parent update (for inherance behaviour)
    if (shell.update) shell._update = shell.update;

    // Bind
    for (var p in Shell.prototype) shell[p] = Shell.prototype[p];

    return shell;
  }

  Shell.prototype.update = function() {
    // Update from @Particle
    if (this._update) this._update();

    if (this.position.y <= this.geometry.parameters.height) {
      this._update = null;
    }
  };

  // Static stuff
  Shell.COLOR = game.COLORS[6];
  Shell.SIZE = 4;
  Shell.SPEED_MIN = 4;
  Shell.SPEED_MAX = 8;

  game.Shell = Shell;
}(game));