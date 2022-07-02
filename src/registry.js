const Fb = require("./firebase");
const Flame = require("./flame");
const FlameError = require("./errors");


/*
 * Manages singleton Flame instances by name.
 */
class Registry {
  static #instances = {};

  static async ignite(name, config, dbURL, certificate) {
    if (name in Registry.#instances) {
      throw new FlameError(`Flame already exists for name '${name}'`);
    }

    const fbApp = await Fb.create(config, dbURL, certificate);
    Registry.#instances[name] = new Flame(fbApp, config.pluralize ?? false);
    return Registry.#instances[name];
  }

  static hold(name) {
    if (!(name in Registry.#instances)) {
      throw new FlameError(`Flame not found for name '${name}''`);
    }

    return Registry.#instances[name];
  }

  static async quench(name) {
    if (!(name in Registry.#instances)) {
      return;
    }

    await Registry.#instances[name].quench();
    delete Registry.#instances[name];
  }
}


module.exports = Registry;
