(function() {
  var Adapter, Configuration, Flame, Shape, cloneDeep, isArray, isBoolean, merge;

  Adapter = require('./adapter');

  cloneDeep = require('lodash/cloneDeep');

  Configuration = require('./configuration');

  isArray = require('lodash/isArray');

  isBoolean = require('lodash/isBoolean');

  merge = require('lodash/merge');

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

    shape(_type, _obj, _opts = {}) {
      var config;
      config = this.config.extend(_opts);
      return new Shape(this.adapter, _type, _obj, config);
    }

  };

  module.exports = Flame;

}).call(this);
