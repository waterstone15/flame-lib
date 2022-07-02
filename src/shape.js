const uuid = require("uuid");

const Spark = require("./spark");
const FlameError = require("./errors");


class Shape {
  static base(flame) {
    const defaults = {}, ok = {};
    Spark.perSection(section => defaults[section] = {});
    Spark.perSection(section => ok[section] = {});
    return new Shape(flame, "__flame__", defaults, ok);
  }

  #flame = null;
  #type = null;
  #defaults = null;
  #ok = null;

  constructor(flame, type, defaults, ok) {
    this.#flame = flame;
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
    Spark.perSection(section => defaults[section] = spec[section] ?? {});
    Spark.perSection(section => ok[section] = (spec.ok ?? {})[section] ?? {});

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
    Spark.perSection(section => Object.keys(defaults[section]).forEach((k) => check(section, k)));

    // normalize all defaults to be functions:
    const normalize = (spec, key) => {
      const v = spec[key];
      spec[key] = (typeof v === "function") ? v : () => v;
    };
    Spark.perSection(section => {
      const s = defaults[section];
      Object.keys(s).forEach((k) => normalize(s, k));
    });

    return new Shape(this.#flame, type, defaults, ok);
  }

  /*
   * Create an instance of this Shape, with the given values.
   */
  spark(from) {
    // Verify 'from' is a subset of the specs:
    Spark.perSection(section => Object.keys(from[section] ?? {}).forEach((k) => {
      if (!(k in this.#defaults[section])) throw new FlameError(`Unexpected key '${section}.${k}'`);
    }));

    // Initialize all fields:
    const values = {};
    Spark.perSection(section => {
      const defaults = this.#defaults[section];
      const s = {...from[section] ?? {}};
      Object.keys(defaults).forEach((k) => s[k] = k in s ? s[k] : defaults[k]());
      values[section] = s;
    });

    return new Spark(this, values);
  }

  ok(spark) {
    return this.errors(spark).length == 0;
  }

  errors(spark) {
    const okSection = section => {
      const s = spark[section];
      const badKeys = Object.keys(s).filter(k => !this.#ok[section][k](s[k]));
      return badKeys.map(k => `${section}.${k}`);
    };
    var ret = [];
    Spark.perSection(section => ret = ret.concat(okSection(section)));
    return ret;
  }

  get(id) {
    return this.#flame.get(id);
  }

  find(...filters) {
    return this.#flame.find(...filters);
  }

  list() {
    return this.#flame.list(this);
  }

  save(spark) {
    return this.#flame.save(spark);
  }

  update(spark) {
    return this.#flame.update(spark);
  }

  upsert(spark) {
    return this.#flame.upsert(spark);
  }

  remove(spark) {
    return this.#flame.remove(spark);
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
    return new Spark(this, values);
  }
}


module.exports = Shape;
