/* jshint -W008 */

(function(game) {
  'use strict';

  function Collider(owner, range, onCollide, obstacles, isPointCollider) {
    if (!owner) console.die('[Collider] Need owner to construct');

    this.range = range || 4;
    this.isPointCollider = isPointCollider;
    this.position = owner.position;
    this.onCollide = onCollide || function() {};
    this.obstacles = obstacles;
    this.collideWith = [];

    return this;
  }

  Collider.prototype.update = function() {
    // Clear collisionWith
    this.collideWith.length = 0;
    this._rangeX = null;
    this._rangeZ = null;

    // Add obstacles
    this.obstacles.forEach(function(o) { this.collideWith = this.collideWith.concat(game.Scene.current.level[o]) }, this);

    if (this.isPointCollider) {
      this.collisionTarget = this.collideWith.filter(function(e, i) {
        return e ? Math.abs(this.position.x - e.position.x) < this.range && Math.abs(this.position.z - e.position.z) < this.range : null;
      }, this)[0];
    } else {
      // Restart collisions
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      // Detect
      this.collideWith.forEach(function(e) {
        this.rangeX = Math.abs(this.position.x - e.position.x) - (e.geometry.parameters.width * .5);
        this.rangeZ = Math.abs(this.position.z - e.position.z) - (e.geometry.parameters.depth * .5);
        this.collX = this.rangeX < this.range;
        this.collZ = this.rangeZ < this.range;

        if (this.collX && this.collZ) {
          this[this.position.x < e.position.x ? 'right' : 'left'] = true;
          this.collisionTarget = e;
        }
        if (this.collZ && this.collX) {
          this[this.position.z > e.position.z ? 'up'  : 'down'] = true;
          this.collisionTarget = e;
        }


      }, this);
    }

    // Run callback
    if (this.collisionTarget) this.onCollide(this.collisionTarget);
  };

  game.Collider = Collider;
}(game));