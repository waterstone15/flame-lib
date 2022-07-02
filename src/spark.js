const FlameError = require("./errors");


/*
 * A Flame Shape Instance.
 */
class Spark {
  /*
   * Invoke given callback for each section of a Spark / Shape.
   * This exists in order to minimize the number of places that have to know the full set of sections.
   */
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
    Spark.perSection(section => this[section] = values[section]);
  }

  ok() {
    return this.shape.ok(this);
  }

  errors() {
    return this.shape.errors(this);
  }

  save() {
    return this.shape.save(this);
  }

  update() {
    return this.shape.update(this);
  }

  upsert() {
    return this.shape.upsert(this);
  }

  remove() {
    return this.shape.remove(this);
  }

  /*
   * A plain JS object that is equivalent to this Spark.
   */
  plainObject() {
    const o = {};
    Spark.perSection(section => o[section] = {});
    const encode = (section, key) => o[section][key] = this[section][key];
    Spark.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return o;
  }

  /*
   * Converts this Spark to the internal Json format suitable for persistence.
   */
  collapse() {
    const json = {};
    const encode = (section, key) => json[`${section}:${key}`] = this[section][key];
    Spark.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return json;
  }

  /*
   * Converts from the internal Json format back into a Spark plain object.
   */
  static expand(json) {
    const values = {};
    Spark.perSection(section => values[section] = {});

    const decode = (encodedKey) => {
      const [section, key] = encodedKey.split(":");
      values[section][key] = json[encodedKey];
    }
    Object.keys(json).forEach(key => decode(key));

    return values;
  }
};


module.exports = Spark;
