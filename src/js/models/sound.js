/* jshint -W008 */

(function(game) {
  'use strict';

  function Sound(src) {
    if (!src) console.die('[Sonud] need src to construct');

    // Add generated 3D model by Loader
    var sound = new Audio();
    sound.src = src;

    // Play
    sound._play = sound.play;

    // Bind
    for (var p in Sound.prototype) sound[p] = Sound.prototype[p];

    return sound;
  }

  Sound.prototype.play = function(callback) {
    this.pause();

    var self = this;

    setTimeout(function() {
      self.currentTime = 0;
      self.plabackRate = game.time.slomo;
      self._play();

      if (callback) self.onended = function() {
        self.onended = null;
        callback();
      };
    }, 100);

    return this;
  };

  // Static stuff
  Sound._srcs = {
    player: {
      powerup: [0,,0.2129,,0.4321,0.2283,,0.1153,,0.3168,0.4836,,,0.3171,,,,,1,,,,,0.5],
      slomo: [2,,0.69,0.0134,0.44,0.23,0.03,-0.16,,,,,,0.0007,0.1874,,0.0222,-0.0021,1,,,,,0.5],
      dash: [3,0.0772,0.01,0.16,0.44,0.1237,,0.4453,-0.1649,-0.3811,0.6503,-0.3238,-0.0557,0.1925,0.0662,0.01,0.24,,0.5565,-0.0023,0.2238,0.1683,-0.0532,0.5]
    },
    shotgun: {
      shot: [3,,0.17,1,0.26,0.09,,,,,,,,,,,,,1,,,,,0.5]
    },
    gun: {
      shot: [3,,0.17,1,0.27,0.12,,,,,,,,,,,,,1,,,,,0.5],
      reload: [1,,0.1951,,0.1799,0.2089,,,,,,,,,,,,,1,,,0.1,,0.5],
      damage: [3,,0.0937,,0.2664,0.38,,-0.468,,,,,,,,,,,1,,,,,0.5]
    },
    liftroom: {
      bell: [0,,0.0471,0.89,0.75,0.48,,,,,,,,,,,-0.0799,,0.39,-0.18,,,,0.5]
    }
  };

  Sound.init = function() {
    var sounds = {
      add: function(s, ss, src) { Sound.add(s, ss, src, this) }
    };

    for (var s in Sound._srcs) for (var ss in Sound._srcs[s]) Sound.add(s, ss, jsfxr(Sound._srcs[s][ss]), sounds);

    return sounds;
  };

  Sound.add = function(s, ss, src, toWhat) {
    if (!toWhat[s]) toWhat[s] = {};

    toWhat[s][ss] = new Sound(src);
  };

  game.Sound = Sound;
}(game));