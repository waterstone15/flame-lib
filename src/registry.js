const Fb = require("./firebase");
const Dao = require("./dao");
const Flame = require("./flame");
const FlameError = require("./errors");


/*
 * Manages singleton Flame instances by name.
 */
class Registry {
  static #instances = {};

  static async ignite(name, config, dbURL) {
    if (name in Registry.#instances) {
      return null
    }

    const [fbApp, db] = await Fb.create(name, config, dbURL);
    const pluralize = config.pluralize ?? true;
    const dao = new Dao(fbApp, db, pluralize);
    Registry.#instances[name] = new Flame(dao);
    return Registry.#instances[name];
  }

  static hold(name) {
    if (!(name in Registry.#instances)) {
      return null
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
