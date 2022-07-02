const FlameError = require("./errors");
const Shape = require("./shape");


/*
 * The core Flame framework interface.
 * Instances of this are to be managed only via the FlameRegistry.
 */
class Flame {
  #fbApp = null;
  #pluralize = null;
  #baseShape = null;

  constructor(fbApp, pluralize) {
    this.#fbApp = fbApp;
    this.#pluralize = pluralize;
    this.#baseShape = Shape.base(this);
  }

  async quench() {
    await this.#fbApp.delete();
  }

  shape(name, spec) {
    return this.#baseShape.extend(name, spec);
  }

  write(...writables) {
    throw new FlameError(`Not implemented!`);
  }
}


module.exports = Flame;
