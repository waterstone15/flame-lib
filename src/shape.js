const uuid = require("uuid");

const Spark = require("./spark");
const FlameError = require("./errors");


class Shape {
  static base = Shape.#base();

  static #base() {
    const defaults = {}, ok = {};
    Spark.perSection((section) => defaults[section] = {});
    Spark.perSection((section) => ok[section] = {});
    return new Shape("__flame__", defaults, ok);
  }

  #type = null;
  #defaults = null;
  #ok = null;

  constructor(type, defaults, ok) {
    this.#type = type;
    this.#defaults = defaults;
    this.#ok = ok;

    this.#defaults.meta.type = () => this.#type;
    this.#defaults.meta.id = () => `${this.#type}:${uuid.v4()}`;

    this.#ok.meta.type = (v) => typeof v === "string" && v.length > 0;
    this.#ok.meta.id = (v) => typeof v === "string" && v.length > 0;
  }

  ok(section, key) {
    return this.#ok[section][key];
  }

  extend(type, spec) {
    const defaults = {};
    const ok = {};
    Spark.perSection((section) => defaults[section] = spec[section] ?? {});
    Spark.perSection((section) => ok[section] = (spec.ok ?? {})[section] ?? {});

    // verify "id" and "type" aren't explicit in the "meta" section:
    if ("id" in defaults.meta) {
      throw new FlameError(`'id' is a reserved attribute for 'meta' section of Flame spec`);
    }
    if ("type" in defaults.meta) {
      throw new FlameError(`'type' is a reserved attribute for 'meta' section of Flame spec`);
    }

    // verify 'ok' for every field:
    const check = (section, key) => {
      if (typeof (ok[section] ?? {})[key] !== "function") {
        throw new FlameError(`'ok.${section}.${key}' of Flame spec must be a function`);
      }
    };
    Spark.perSection((section) => Object.keys(defaults[section]).forEach((k) => check(section, k)));

    // normalize all defaults to be functions:
    const normalize = (spec, key) => {
      const v = spec[key];
      spec[key] = (typeof v === "function") ? v : () => v;
    };
    Spark.perSection((section) => {
      const s = defaults[section];
      Object.keys(s).forEach((k) => normalize(s, k));
    });

    return new Shape(type, defaults, ok);
  }

  /*
   * Create an instance of this Shape, with the given values.
   */
  spark(from) {
    // Verify 'from' is a subset of the specs:
    Spark.perSection((section) => Object.keys(from[section] ?? {}).forEach((k) => {
      if (!(k in this.#defaults[section])) throw new FlameError(`Unexpected key '${section}.${k}'`);
    }));

    // Initialize all fields:
    const values = {};
    Spark.perSection((section) => {
      const defaults = this.#defaults[section];
      const s = {...from[section] ?? {}};
      Object.keys(defaults).forEach((k) => s[k] = k in s ? s[k] : defaults[k]());
      values[section] = s;
    });

    return new Spark(this, values);
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
}


module.exports = Shape;
