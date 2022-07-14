const uuid = require("uuid");

const Spark = require("./spark");
const Util = require("./util");
const FlameError = require("./errors");


class Shape {
  static base(flame) {
    const defaults = {}, ok = {};
    Util.perSection(section => defaults[section] = {});
    Util.perSection(section => ok[section] = {});
    return new Shape(flame, "__flame__", defaults, ok);
  }

  #dao = null;
  #type = null;
  #defaults = null;
  #ok = null;

  constructor(dao, type, defaults, ok) {
    this.#dao = dao;
    this.#type = type;
    this.#defaults = defaults;
    this.#ok = ok;

    this.#defaults.meta.type = () => this.#type;
    this.#defaults.meta.id = () => `${this.#type}:${uuid.v4()}`;

    this.#ok.meta.type = (v) => typeof v === "string" && v.length > 0;
    this.#ok.meta.id = (v) => typeof v === "string" && v.length > 0;
  }

  extend(type, spec) {
    const defaults = {};
    const ok = {};
    Util.perSection(section => defaults[section] = spec[section] ?? {});
    Util.perSection(section => ok[section] = (spec.ok ?? {})[section] ?? {});

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
    Util.perSection(section => Object.keys(defaults[section]).forEach((k) => check(section, k)));

    // normalize all defaults to be functions:
    const normalize = (spec, key) => {
      const v = spec[key];
      spec[key] = (typeof v === "function") ? v : () => v;
    };
    Util.perSection(section => {
      const s = defaults[section];
      Object.keys(s).forEach((k) => normalize(s, k));
    });

    return new Shape(this.#dao, type, defaults, ok);
  }

  /*
   * Create an instance of this Shape, with the given values.
   */
  spark(from) {
    // Verify 'from' is a subset of the specs:
    Util.perSection(section => Object.keys(from[section] ?? {}).forEach((k) => {
      if (!(k in this.#defaults[section])) throw new FlameError(`Unexpected key '${section}.${k}'`);
    }));

    // Initialize all fields:
    const values = {};
    Util.perSection(section => {
      const defaults = this.#defaults[section];
      const s = {...from[section] ?? {}};
      Object.keys(defaults).forEach((k) => s[k] = k in s ? s[k] : defaults[k]());
      values[section] = s;
    });

    return new Spark(this.#dao, this.#ok, values);
  }

  async get(id) {
    return await this.#dao.get(this.#type, this.#ok, id);
  }

  async find(...filters) {
    return await this.#dao.find(this.#type, this.#ok, filters);
  }

  async list(...filters) {
    return await this.#dao.list(this.#type, this.#ok, filters);
  }

  async remove(id) {
    await this.#dao.remove(id);
  }

  /*
   * Converts a Spark to the internal Json format suitable for persistence.
   */
  toInternalJson(spark) {
    return spark.collapse();
  }

  /*
   * Converts back into a Spark from the internal Json format from the persistence layer.
   */
  fromInternalJson(json) {
    const values = Spark.expand(json);
    return new Spark(this.#dao, this.#ok, values);
  }
}


module.exports = Shape;
