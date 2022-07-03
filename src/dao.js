const pluralize = require("pluralize");
const casing = require("change-case");

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

  async get(type, id, validators) {
    const collection = this.#collection(type);
    const doc = db.collection(collection).doc(id);
    const res = await doc.get();
    if (!res.exists) {
      throw new FlameError(`Spark '${id}' for shape '${type}' not found`);
    }
    return new Spark(this, validators, res.data());
  }

  async find(type, ...filters) {
    const collection = this.#collection(type);
    const doc = db.collection(collection);

    throw new FlameError(`Not implemented!`);
    // https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#endAt-examples
  }

  async list(type, ...filters) {
    const collection = this.#collection(type);
    const doc = db.collection(collection);

    throw new FlameError(`Not implemented!`);
    // https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#endAt-examples
  }

  async insert(spark) {
    const doc = this.#docRef(spark);
    await doc.create(plainObj);
  }

  async update(spark) {
    const doc = this.#docRef(spark);
    await ref.update(plainObj);
  }

  async upsert(spark) {
    const doc = this.#docRef(spark);
    await doc.set(plainObj);
  }

  async remove(id) {
    const doc = this.#docRef(spark);
    await doc.delete(plainObj);
  }

  #docRef(spark) {
    const id = spark.meta.id;
    const type = spark.meta.type;
    const plainObj = spark.plainObject();
    const collection = this.#collection(type);

    return db.collection(collection).doc(id);
  }

  #collection(type) {
    const name = this.#pluralize ? pluralize(type) : type;
    return casing.paramCase(name);
  }
}


module.exports = Dao;
