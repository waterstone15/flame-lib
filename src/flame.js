(function() {
  var Adapter, Configuration, Flame, Shape;

  Adapter = require('./adapter');

  Configuration = require('./configuration');

  Shape = require('./shape');

  Flame = class Flame {
    constructor(_app, _opts = {}) {
      this.adapter = new Adapter(_app);
      this.app = _app;
      this.config = new Configuration(_opts);
      return;
    }

    wildfire() {
      return this.app.fba;
    }

    model() {
      return this.shape(...arguments);
    }

    shape(_type, _obj, _opts = {}) {
      var config;
      config = this.config.extend(_opts);
      return new Shape(this.adapter, _type, _obj, config);
    }

  };

  module.exports = Flame;

}).call(this);
