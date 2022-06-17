const FlameError = require("./errors");


class Shape {
  #meta = null;
  #val = null;
  #ref = null;
  #ext = null;

  constructor(meta, val, ref, ext) {
    this.#meta = meta;
    this.#val = val;
    this.#ref = ref;
    this.#ext = ext;
  }

  static fromSpec(spec) {
    // verify "meta" and "val" sections are present:
    if (!("meta" in spec)) {
      throw new FlameError(`'meta' section is missing from Flame spec`);
    }
    if (!("val" in spec)) {
      throw new FlameError(`'val' section is missing from Flame spec`);
    }

    const meta = spec.meta;
    const val = spec.val;
    const ref = "ref" in spec ? spec.ref : {};
    const ext = "ext" in spec ? spec.ext : {};

    // verify "id" and "type" are present in the "meta" section:
    if (!("id" in meta)) {
      throw new FlameError(`'id' missing from 'meta' section of Flame spec`);
    }
    if (!("type" in meta)) {
      throw new FlameError(`'type' missing from 'meta' section of Flame spec`);
    }
    if (typeof meta.type.default !== "string") {
      throw new FlameError(`'meta.type.default' of Flame spec must be a string value`);
    }

    // verify 'ok' and 'default' in every field:
    const checkField = (sectionName, key, field) => {
      if (!("default" in field)) {
        throw new FlameError(`'default' of '${key}' field of '${sectionName}' section of Flame spec is missing`);
      }
      if (typeof field.ok !== "function") {
        throw new FlameError(`'ok' of '${key}' field of '${sectionName}' section of Flame spec must be a function`);
      }
    };
    const checkSection = (name, section) => Object.keys(section).forEach((k) => checkField(name, k, section[k]));
    checkSection("meta", meta);
    checkSection("val", val);
    checkSection("ref", ref);
    checkSection("ext", ext);

    // transforms all defaults into functions:
    const transformField = (f) => {
      if (typeof f.default !== "function") {
        const v = f.default;
        f.default = () => v;
      }
    };
    const transformSection = (spec) => Object.keys(spec).forEach((k) => transformField(spec[k]));
    transformSection(meta);
    transformSection(val);
    transformSection(ref);
    transformSection(ext);

    // create and return Shape:
    return new Shape(meta, val, ref, ext);
  }

  /*
   * Create an instance of this Shape, with the given values.
   */
  spark(_given) {
    // TODO: currently only populates using the defaults and the '_given' values are ignored.
    const o = {meta: {}, var: {}, ref: {}, ext: {}};

    const initField = (s, k, dfault) => s[k] = k in s ? s[k] : dfault();
    const init = (s, spec) => Object.keys(spec).forEach((k) => initField(s, k, spec[k].default));
    init(o.meta, this.#meta);
    init(o.val, this.#val);
    init(o.ref, this.#ref);
    init(o.ext, this.#ext);

    const okSection = (s, spec) => Object.keys(s).every((k) => spec[k].ok(s[k]));
    const okAll = (o) => okSection(o.meta, this.#meta) &&
      okSection(o.val, this.#val) &&
      okSection(o.ref, this.#ref) &&
      okSection(o.ext, this.#ext);
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
