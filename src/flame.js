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

  get(id) {
    throw new FlameError(`Not implemented!`);
  }

  find(...filters) {
    throw new FlameError(`Not implemented!`);
  }

  list() {
    throw new FlameError(`Not implemented!`);
  }

  save(spark) {
    throw new FlameError(`Not implemented!`);
  }

  update(spark) {
    throw new FlameError(`Not implemented!`);
  }

  upsert(spark) {
    throw new FlameError(`Not implemented!`);
  }

  remove(spark) {
    throw new FlameError(`Not implemented!`);
  }
}


module.exports = Flame;
