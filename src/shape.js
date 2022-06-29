const uuid = require("uuid");

const Spark = require("./spark");
const FlameError = require("./errors");


class Shape {
  static base = Shape.#base();
  #type = null;
  #defaults = null;
  ok = null;

  constructor(type, meta, val, ref, ext, ok) {
    this.#type = type;
    this.#defaults = {
      meta: meta,
      val: val,
      ref: ref,
      ext: ext,
    };
    this.ok = ok;

    this.#defaults.meta.type = () => this.#type;
    this.#defaults.meta.id = () => `${this.#type}:${uuid.v4()}`;

    this.ok.meta.type = (v) => typeof v === "string" && v.length > 0;
    this.ok.meta.id = (v) => typeof v === "string" && v.length > 0;
  }

  static #base() {
    return new Shape(
      "__flame__",
      {}, // meta
      {}, // val
      {}, // ref
      {}, // ext
      { // ok
        meta: {},
        val: {},
        ref: {},
        ext: {},
      },
    );
  }

  extend(type, spec) {
    const meta = spec.meta ?? {};
    const val = spec.val ?? {};
    const ref = spec.ref ?? {};
    const ext = spec.ext ?? {};
    const ok = spec.ok ?? {};
    ok.meta = ok.meta ?? {};
    ok.val = ok.val ?? {};
    ok.ref = ok.ref ?? {};
    ok.ext = ok.ext ?? {};

    // verify "id" and "type" aren't explicit in the "meta" section:
    if ("id" in meta) {
      throw new FlameError(`'id' is a reserved attribute for 'meta' section of Flame spec`);
    }
    if ("type" in meta) {
      throw new FlameError(`'type' is a reserved attribute for 'meta' section of Flame spec`);
    }

    // verify 'ok' for every field:
    const checkField = (sectionName, key) => {
      if (typeof (ok[sectionName] ?? {})[key] !== "function") {
        throw new FlameError(`'ok.${sectionName}.${key}' of Flame spec must be a function`);
      }
    };
    const checkSection = (name, section) => Object.keys(section).forEach((k) => checkField(name, k));
    checkSection("meta", meta);
    checkSection("val", val);
    checkSection("ref", ref);
    checkSection("ext", ext);

    // transforms all defaults into functions:
    const transformField = (spec, key) => {
      const v = spec[key];
      spec[key] = (typeof v === "function") ? v : () => v;
    };
    const transformSection = (spec) => Object.keys(spec).forEach((k) => transformField(spec, k));
    transformSection(meta);
    transformSection(val);
    transformSection(ref);
    transformSection(ext);

    // create and return Shape:
    return new Shape(type, meta, val, ref, ext, ok);
  }

  /*
   * Create an instance of this Shape, with the given values.
   */
  spark(from) {
    // Verify 'from' is a subset of the specs:
    const matches = (section) => Object.keys(from[section] ?? {}).forEach((k) => {
      if (!(k in this.#defaults[section])) throw new FlameError(`Unexpected key '${section}.${k}'`);
    });
    matches("meta");
    matches("val");
    matches("ref");
    matches("ext");

    // Initialize all fields:
    const init = (section) => {
      const defaults = this.#defaults[section];
      const given = from[section] ?? {};
      const s = {};
      Object.keys(defaults).forEach((k) => s[k] = k in given ? given[k] : defaults[k]());
      return s;
    }
    return new Spark(this, init("meta"), init("val"), init("ref"), init("ext"));
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
