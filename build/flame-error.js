(function() {
  var FlameError;

  FlameError = class FlameError extends Error {
    constructor(...args) {
      super(...args);
      this.name = "FlameError";
      return;
    }

  };

  module.exports = FlameError;

}).call(this);
