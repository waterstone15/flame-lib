var { paramCase, snakeCase } = require('change-case');


class Util {
  /*
   * Invoke given callback for each section of a Spark / Shape.
   * This exists in order to minimize the number of places that have to know the full set of sections.
   */
  static perSection(callback) {
    callback("ext");
    callback("index");
    callback("meta");
    callback("ref");
    callback("val");
  }

  static allFields(obj) {
    var all_fields = []
    this.perSection((section) => {
      Object.keys(obj[section]).forEach((key) => {
        all_fields.push(`${section}:${snakeCase(key)}`)
      })
    });
    return all_fields;
  }

  /*
   * Converts an expanded JS object (from Flame) to a collapsed JS object (for Firestore).
   */
  static collapse(obj) {
    const _obj = {};
    const encode = (section, key) => _obj[`${section}:${paramCase(key)}`] = obj[section][key];
    Util.perSection(section => Object.keys(obj[section]).forEach(key => encode(section, key)));
    return _obj;
  }

  /*
   * Converts a collapsed JS object (from Firestore) to an expanded JS object (for Flame).
   */
  static expand(obj) {
    const _obj = {};
    Util.perSection(section => _obj[section] = {});

    const decode = (encodedKey) => {
      const [section, key] = encodedKey.split(":");
      _obj[section][snakeCase(key)] = obj[encodedKey];
    }
    Object.keys(obj).forEach(key => decode(key));
    return _obj;
  }

};


module.exports = Util;
