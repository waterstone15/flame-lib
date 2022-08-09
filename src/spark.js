// const Fragment = require("./fragment");
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

  // fragment() {
  //   return new Fragment(this.#dao, this.#validators, this.meta.type, this.meta.id);
  // }

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
    const obj = {};
    Util.perSection(section => obj[section] = {});
    const encode = (section, key) => obj[section][key] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return obj;
  }

};


module.exports = Spark;
