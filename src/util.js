

class Util {
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
};


module.exports = Util;
