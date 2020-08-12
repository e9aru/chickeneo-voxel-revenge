/* jshint -W008 */

(function(game) {
  'use strict';

  function Text(string, size, color) {
    string = string || '.';
    size = size || Text.size;

    var geometry = new THREE.TextGeometry(string, {
      font: game.fonts.default,
      size: size,
      height: Text.height
    });

    var text = new THREE.Mesh(geometry, Text.material);
    text.key = 'text';
    text.gkey = 'texts';
    text.value = string;
    text.font = game.fonts.default;
    text.size = size;

    if (color) text.material.setValues({ color: color });

    // Bind
    for (var p in Text.prototype) text[p] = Text.prototype[p];

    return text;
  }

  Text.prototype.set = function(string) {
    this.value = string + '';

    this.geometry = null;
    this.geometry = new THREE.TextGeometry(string, {
      font: this.font,
      size: this.size,
      height: Text.height
    });
  };

  // Static stuff
  Text.size = 8;
  Text.height = .04;
  Text.material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

  game.Text = Text;
}(game));