const pluralize = require("pluralize");
const casing = require("change-case");
const fs = require("firebase-admin/firestore");

const Spark = require("./spark");
const FlameError = require("./errors");


/*
 * Persisntence layer over Firebase for Sparks.
 */
class Dao {
  #fbApp = null;
  #db = null;
  #pluralize = null;

  constructor(fbApp, pluralize) {
    this.#fbApp = fbApp;
    this.#db = fs.getFirestore(this.#fbApp);
    this.#pluralize = pluralize;
  }

  async release() {
    await this.#db.terminate();
    await this.#fbApp.delete();
  }

  async get(type, id, validators) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);
    const res = await doc.get();
    if (!res.exists) {
      throw new FlameError(`Spark '${id}' for shape '${type}' not found`);
    }
    return new Spark(this, validators, res.data());
  }

  async find(type, ...filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    throw new FlameError(`Not implemented!`);
    // https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#endAt-examples
  }

  async list(type, ...filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    throw new FlameError(`Not implemented!`);
    // https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#endAt-examples
  }

  async insert(spark) {
    const doc = this.#docRef(spark);
    try {
      await doc.create(spark.plainObject());
    } catch(err) {
      if (err.code === 6) { // "already-exists"
        throw new FlameError(`Spark '${spark.meta.id}' for shape '${spark.meta.type}' already exists`);
      } else {
        throw err;
      }
    }
  }

  async update(spark) {
    const doc = this.#docRef(spark);
    try {
      await doc.update(spark.plainObject());
    } catch(err) {
      if (err.code === 5) { // "not-fouund"
        throw new FlameError(`Spark '${spark.meta.id}' for shape '${spark.meta.type}' not found`);
      } else {
        throw err;
      }
    }
  }

  async upsert(spark) {
    const doc = this.#docRef(spark);
    await doc.set(spark.plainObject());
  }

  async remove(type, id) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);

    await doc.delete();
  }

  #docRef(spark) {
    const id = spark.meta.id;
    const type = spark.meta.type;
    const collection = this.#collection(type);

    return this.#db.collection(collection).doc(id);
  }

  #collection(type) {
    const name = this.#pluralize ? pluralize(type) : type;
    return casing.paramCase(name);
  }
}


module.exports = Dao;
