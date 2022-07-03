const Fb = require("./firebase");
const Flame = require("./flame");
const FlameError = require("./errors");


/*
 * Persisntence layer over Firebase for Sparks.
 */
class Dao {
  #fb = null;
  #pluralize = null;

  constructor(fb, pluralize) {
    this.#fb = fb;
    this.#pluralize = pluralize;
  }

  async release() {
    await this.#fb.delete();
  }

  get(id) {
    throw new FlameError(`Not implemented!`);
  }

  find(...filters) {
    throw new FlameError(`Not implemented!`);
  }

  list() {
    throw new FlameError(`Not implemented!`);
  }

  save(spark) {
    throw new FlameError(`Not implemented!`);
  }

  update(spark) {
    throw new FlameError(`Not implemented!`);
  }

  upsert(spark) {
    throw new FlameError(`Not implemented!`);
  }

  remove(id) {
    throw new FlameError(`Not implemented!`);
  }

}


module.exports = Dao;
