const FlameError = require("./errors");
const Shape = require("./shape");
const Batch = require("./batch");


/*
 * The core Flame framework interface.
 * Instances of this are to be managed only via the FlameRegistry.
 */
class Flame {
  #dao = null;
  #baseShape = null;

  constructor(dao) {
    this.#dao = dao;
    this.#baseShape = Shape.base(dao);
  }

  async quench() {
    await this.#dao.release();
    this.#dao = null;
  }

  shape(name, spec) {
    return this.#baseShape.extend(name, spec);
  }

  writeBatch() {
    return new Batch(this.#dao);
  }

  wildfire() {
    return this.#dao.wildfire();
  }
}


module.exports = Flame;
