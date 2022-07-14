const pluralize = require("pluralize");
const casing = require("change-case");
const fs = require("firebase-admin/firestore");

const Spark = require("./spark");
const FlameError = require("./errors");


/*
 * Persisntence layer (DAO = Data Access Object) over Firebase for Sparks.
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

  async get(type, validators, id) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);
    const res = await doc.get();
    if (!res.exists) {
      return null;
    }
    return new Spark(this, validators, res.data());
  }

  async find(type, validators, filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    var query = doc.where("meta.type", "==", type);
    filters.forEach(filter => {
      // query = query.where(filter.field, filter.op, filter.value);
      query = query.where(filter[0], filter[1], filter[2]);
    });
    const res = await query.get();

    if (res.empty) {
      return null;
    } else if (res.size == 1) {
      const plainObject = res.docs[0].data();
      return new Spark(this, validators, plainObject);
    } else {
      throw new FlameError(`More than one Sparks match the given filters`);
    }
  }

  async list(type, validators, pageSize, pageNo, filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    var query = doc.where("meta.type", "==", type);
    filters.forEach(filter => {
      // query = query.where(filter.field, filter.op, filter.value);
      query = query.where(filter[0], filter[1], filter[2]);
    });
    query = query.limit(pageSize).offset(pageSize * pageNo);
    const res = await query.get();

    return res.docs.map(doc => new Spark(this, validators, doc.data()));
  }

  async insert(spark) {
    const doc = this.#docRef(spark.meta);
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

  async update(fragments) {
    const meta = fragments.meta;
    const doc = this.#docRef(meta);
    try {
      await doc.update(fragments.plainObject());
    } catch(err) {
      if (err.code === 5) { // "not-fouund"
        throw new FlameError(`Spark '${meta.id}' for shape '${meta.type}' not found`);
      } else {
        throw err;
      }
    }
  }

  async upsert(spark) {
    const doc = this.#docRef(spark.meta);
    await doc.set(spark.plainObject());
  }

  async remove(type, id) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);

    await doc.delete();
  }

  #docRef(meta) {
    const id = meta.id;
    const type = meta.type;
    const collection = this.#collection(type);

    return this.#db.collection(collection).doc(id);
  }

  #collection(type) {
    const name = this.#pluralize ? pluralize(type) : type;
    return casing.paramCase(name);
  }

  wildfire() {
    return {
      firebase: this.#fbApp,
      firestore: this.#db,
    }
  }
}


module.exports = Dao;
