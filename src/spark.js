var isArray = require("lodash/isArray");
var isFunction = require("lodash/isFunction");
var reduce = require("lodash/reduce");
var intersection = require("lodash/intersection");
var { paramCase } = require("change-case");
var { snakeCase } = require("change-case");

const Util = require("./util");
const FlameError = require("./errors");


/*
 * A Flame Shape Instance.
 */
class Spark {
  #dao = null;
  #validators = null;
  ext = null;
  index = null;
  meta = null;
  ref = null;
  val = null;

  constructor(dao, validators, plainObj) {
    this.#dao = dao;
    this.#validators = validators;
    Util.perSection(section => this[section] = {});
    Util.perSection(section => Object.keys(plainObj[section]).forEach(key => this[section][snakeCase(key)] = plainObj[section][key]));
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

  ok(fields) {
    var af = Util.allFields(this.plainObject())
    fields = isArray(fields) ? intersection(fields, af) : af;

    var ok = reduce(fields, (acc, field, index) => {
      var [section, key] = field.split(':')
      key = snakeCase(key)
      var validate = this.#validators[section][key]
      return isFunction(validate) ? (acc && validate(this[section][key])) : false;
    }, true)

    return ok
  }

  async insert() {
    await this.#dao.insert(this);
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
    const obj = {};
    Util.perSection(section => obj[section] = {});
    const encode = (section, key) => obj[section][key] = this[section][key];
    Util.perSection(section => Object.keys(this[section]).forEach(key => encode(section, key)));
    return obj;
  }

};


module.exports = Spark;
