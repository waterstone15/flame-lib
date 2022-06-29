const uuid = require("uuid");

const FlameError = require("./errors");


class Shape {
  static base = Shape.#base();
  #type = null;
  #meta = null;
  #val = null;
  #ref = null;
  #ext = null;
  #ok = null;

  constructor(type, meta, val, ref, ext, ok) {
    this.#type = type;
    this.#meta = meta;
    this.#val = val;
    this.#ref = ref;
    this.#ext = ext;
    this.#ok = ok;

    this.#meta.type = () => this.#type;
    this.#meta.id = () => `${this.#type}:${uuid.v4()}`;

    this.#ok.meta.type = (v) => typeof v === "string" && v.length > 0;
    this.#ok.meta.id = (v) => typeof v === "string" && v.length > 0;
  }

  static #base() {
    return new Shape(
      "__flame__",
      {}, // meta
      {}, // val
      {}, // ref
      {}, // ext
      {
        meta: {},
        val: {},
        ref: {},
        ext: {},
      }, // ok
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
    // Initialize the object 'o' to be constructed and returned:
    const o = {meta: {}, val: {}, ref: {}, ext: {}, ok: {}};

    // Init 'o' with the defaults:
    const init = (s, spec) => Object.keys(spec).forEach((k) => s[k] = spec[k]());
    init(o.meta, this.#meta);
    init(o.val, this.#val);
    init(o.ref, this.#ref);
    init(o.ext, this.#ext);

    // Verify 'from' is a subset of the specs:
    const matches = (sectionName) => Object.keys(from[sectionName] ?? {}).forEach((k) => {
      if (!(k in o[sectionName])) throw new FlameError(`Unexpected key '${sectionName}.${k}'`);
    });
    matches("meta");
    matches("val");
    matches("rel");
    matches("ext");

    // Override the defaults with the explicitly given values:
    const set = (s, from) => Object.keys(from).forEach((k) => s[k] = from[k]);
    set(o.meta, from.meta ?? {});
    set(o.val, from.val ?? {});
    set(o.ref, from.ref ?? {});
    set(o.ext, from.ext ?? {});

    // Define 'o.ok()':
    const okSection = (s, spec) => Object.keys(s).every((k) => spec[k](s[k]));
    const okAll = (o) => okSection(o.meta, this.#ok.meta) &&
      okSection(o.val, this.#ok.val) &&
      okSection(o.ref, this.#ok.ref) &&
      okSection(o.ext, this.#ok.ext);
    o.ok = () => okAll(o);

    o.save = () => {
      throw new FlameError(`Not implemented!`);
    };

    o.update = () => {
      throw new FlameError(`Not implemented!`);
    };

    o.upsert = () => {
      throw new FlameError(`Not implemented!`);
    };

    o.remove = () => {
      throw new FlameError(`Not implemented!`);
    };

    return o;
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
