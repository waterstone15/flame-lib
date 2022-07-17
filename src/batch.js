const FlameError = require("./errors");
const Shape = require("./shape");


/*
 * A batch-write transaction.
 */
class Batch {
  #dao = null;
  #writes = [];

  constructor(dao) {
    this.#dao = dao;
  }

  writes() {
    return this.#writes;
  }

  insert(spark) {
    this.#writes.push(["insert", spark]);
    return this;
  }

  upsert(spark) {
    this.#writes.push(["upsert", spark]);
    return this;
  }

  update(fragments) {
    this.#writes.push(["update", fragments]);
    return this;
  }

  remove(spark) {
    return this.removeById(spark.meta.type, spark.meta.id);
  }

  removeById(type, id) {
    this.#writes.push(["remove", type, id]);
    return this;
  }

  async commit() {
    await this.#dao.writeBatch(this);
  }
}


module.exports = Batch;
