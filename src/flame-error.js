(function() {
  var FlameError;

  FlameError = class FlameError extends Error {
    constructor(_message) {
      super(_message);
      this.name = "FlameError";
      return;
    }

  };

  module.exports = FlameError;

}).call(this);
