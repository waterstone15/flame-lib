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

  #dao = null;
  #validators = null;
  meta = null;
  val = null;
  ref = null;
  ext = null;

  constructor(dao, validators, plainObj) {
    this.#dao = dao;
    this.#validators = validators;
    Spark.perSection(section => this[section] = {});
    Spark.perSection(section => Object.keys(plainObj[section]).forEach(key => this[section][key] = plainObj[section][key]));
  }

  errors() {
    const okSection = section => {
      const s = this[section];
      const badKeys = Object.keys(s).filter(k => !this.#validators[section][k](s[k]));
      return badKeys.map(k => `${section}.${k}`);
    };
    var ret = [];
    Spark.perSection(section => ret = ret.concat(okSection(section)));
    return ret;
  }

  ok() {
    return this.errors().length == 0;
  }

  async insert() {
    await this.#dao.insert(this);
  }

  async update() {
    await this.#dao.update(this);
  }

  async upsert() {
    await this.#dao.upsert(this);
  }

  async remove() {
    await this.#dao.remove(this.meta.type, this.meta.id);
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
