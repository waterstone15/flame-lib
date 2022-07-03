const Fb = require("./firebase");
const Dao = require("./dao");
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

    const fb = await Fb.create(config, dbURL, certificate);
    const pluralize = config.pluralize ?? false;
    const dao = new Dao(fb, pluralize);
    Registry.#instances[name] = new Flame(dao);
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
