/* jshint -W008 */

(function(game) {
  'use strict';

  function ES(owner, onPathFound) {
    if (!EasyStar || !owner || !onPathFound) console.die('[ES] Need EasyStar and owner and onPathFound to construct');

    var es = new EasyStar.js();
    es.owner = owner;
    es.onPathFound = onPathFound;
    es.setIterationsPerCalculation(200);

    // Bind
    for (var p in ES.prototype) es[p] = ES.prototype[p];

    return es;
  }

  ES.prototype.init = function(grid, acceptable) {
    if (!grid) console.die('[ES] Need grid to init');

    acceptable = acceptable || [];

    this.setGrid(grid);
    this.setAcceptableTiles(acceptable);
  };

  ES.prototype.changeDestination = function(pos) {
    var self = this;

    this.from = game.Scene.current.level.point2Tile(this.owner.position, true);
    this.to = game.Scene.current.level.point2Tile(pos, true);

    this.findPath(
      self.from.x,
      self.from.y,
      self.to.x,
      self.to.y,
      function(path) {
        if (self.onPathFound && path) self.onPathFound(path);
      }
    );

    return this;
  };

  ES.prototype.update = function() {
    if (this.owner.following) this.changeDestination(this.owner.following.position).calculate();
  };

  game.ES = ES;
}(game));