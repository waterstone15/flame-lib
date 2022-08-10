const Util = require("./util");
const FlameError = require("./errors");


/*
 * Fragment of a Flame Spark, for doing partial updates to a Spark.
 */
class Fragment {
  #dao = null;
  #validators = null;
  ext = null;
  index = null;
  meta = null;
  ref = null;
  val = null;

  constructor(dao, validators, type, id) {
    this.#dao = dao;
    this.#validators = validators;
    Util.perSection(section => this[section] = {});
    this.meta.type = type;
    this.meta.id = id;
  }

  set(obj) {
    Util.perSection(section => {
      this[section] = {
        ...this[section],
        ...obj[section],
      };
    });
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
   * A plain JS object that is equivalent to this Fragment.
   */
  plainObject() {
    const obj = {};
    Util.perSection(section => obj[section] = {});
    const encode = (section, key) => obj[section][key] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return obj;
  }

};


module.exports = Fragment;
