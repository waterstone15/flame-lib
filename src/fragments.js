const Util = require("./util");
const FlameError = require("./errors");


/*
 * Fragments of a Flame Spark, for doing partial updates to a Spark.
 */
class Fragments {
  #dao = null;
  #validators = null;
  meta = null;
  val = null;
  ref = null;
  ext = null;

  constructor(dao, validators, type, id) {
    this.#dao = dao;
    this.#validators = validators;
    Util.perSection(section => this[section] = {});
    this.meta.type = type;
    this.meta.id = id;
  }

  set(section, field, value) {
    this[section][field] = value;
    return this;
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

  async update() {
    await this.#dao.update(this);
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
};


module.exports = Fragments;
