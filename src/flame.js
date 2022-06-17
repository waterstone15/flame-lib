const Fb = require("./firebase");
const FlameError = require("./errors");
const Shape = require("./model");


/*
 * The core Flame framework interface.
 * Instances of this are to be managed only via the FlameRegistry.
 */
class Flame {
  #fbApp = null;

  constructor(fbApp) {
    this.#fbApp = fbApp;
  }

  async quench() {
    await this.#fbApp.delete();
  }

  shape(spec) {
    return Shape.fromSpec(spec);
  }

  write(...writables) {
    throw new FlameError(`Not implemented!`);
  }
}

/*
 * Manages singleton Flame instances by name.
 */
class FlameRegistry {
  static #instances = {};

  static async ignite(name, config) {
    if (name in FlameRegistry.#instances) {
      throw new FlameError(`Flame already exists for name '${name}'`);
    }

    const fbApp = await Fb.create(config);
    FlameRegistry.#instances[name] = new Flame(fbApp);
    return FlameRegistry.#instances[name];
  }

  static hold(name) {
    if (!(name in FlameRegistry.#instances)) {
      throw new FlameError(`Flame not found for name '${name}''`);
    }

    return FlameRegistry.#instances[name];
  }

  static async quench(name) {
    if (!(name in FlameRegistry.#instances)) {
      return;
    }

    await FlameRegistry.#instances[name].quench();
    delete FlameRegistry.#instances[name];
  }
}


module.exports = FlameRegistry;
