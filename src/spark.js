const Fragments = require("./fragments");
const Util = require("./util");
const FlameError = require("./errors");


/*
 * A Flame Shape Instance.
 */
class Spark {
  #dao = null;
  #validators = null;
  meta = null;
  val = null;
  ref = null;
  ext = null;

  constructor(dao, validators, plainObj) {
    this.#dao = dao;
    this.#validators = validators;
    Util.perSection(section => this[section] = {});
    Util.perSection(section => Object.keys(plainObj[section]).forEach(key => this[section][key] = plainObj[section][key]));
  }

  errors() {
    const okSection = section => {
      const s = this[section];
      const badKeys = Object.keys(s).filter(k => !this.#validators[section][k](s[k]));
      return badKeys.map(k => `${section}.${k}`);
    };
    var ret = [];
    Util.perSection(section => ret = ret.concat(okSection(section)));
    return ret;
  }

  ok() {
    return this.errors().length == 0;
  }

  async insert() {
    await this.#dao.insert(this);
  }

  fragments() {
    return new Fragments(this.#dao, this.#validators, this.meta.type, this.meta.id);
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
    Util.perSection(section => o[section] = {});
    const encode = (section, key) => o[section][key] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return o;
  }

  /*
   * Converts to a collapsed JS Object suitable for persistence.
   */
  collapse() {
    const obj = {};
    const encode = (section, key) => obj[`${section}:${key}`] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return obj;
  }

  /*
   * Converts a collapsed JS Object back into a Spark JS Object.
   */
  static expand(obj) {
    const values = {};
    Util.perSection(section => values[section] = {});

    const decode = (encodedKey) => {
      const [section, key] = encodedKey.split(":");
      values[section][key] = obj[encodedKey];
    }
    Object.keys(obj).forEach(key => decode(key));

    return values;
  }
};


module.exports = Spark;
