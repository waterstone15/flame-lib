const FlameError = require("./errors");


/*
 * A Flame Shape Instance.
 */
class Spark {
  static perSection(callback) {
    callback("meta");
    callback("val");
    callback("ref");
    callback("ext");
  }

  shape = null;
  meta = null;
  val = null;
  ref = null;
  ext = null;

  constructor(shape, values) {
    this.shape = shape;
    Spark.perSection((section) => this[section] = values[section]);
  }

  ok() {
    return this.errors().length == 0;
  }

  errors() {
    const okSection = (section) => {
      const s = this[section];
      const badKeys = Object.keys(s).filter(k => !this.shape.ok(section, k)(s[k]));
      return badKeys.map(k => `${section}.${k}`);
    };
    var ret = [];
    Spark.perSection((section) => ret = ret.concat(okSection(section)));
    return ret;
  }

  save() {
    throw new FlameError(`Not implemented!`);
  }

  update() {
    throw new FlameError(`Not implemented!`);
  }

  upsert() {
    throw new FlameError(`Not implemented!`);
  }

  remove() {
    throw new FlameError(`Not implemented!`);
  }
};


module.exports = Spark;
