

/*
 * The root of the Flame errors hierarchy.
 */
class FlameError extends Error {
  constructor(message) {
    super(message);
    this.name = "FlameError";
  }
}


module.exports = FlameError;
