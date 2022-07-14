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

  async update() {
    await this.#dao.update(this);
  }

  /*
   * A plain JS object that is equivalent to this Fragments.
   */
  plainObject() {
    const o = {};
    Util.perSection(section => o[section] = {});
    const encode = (section, key) => o[section][key] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return o;
  }
};


module.exports = Fragments;
