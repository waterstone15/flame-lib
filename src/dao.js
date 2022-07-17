const pluralize = require("pluralize");
const casing = require("change-case");

const Spark = require("./spark");
const FlameError = require("./errors");


/*
 * Persisntence layer (DAO = Data Access Object) over Firebase for Sparks.
 */
class Dao {
  #fbApp = null;
  #db = null;
  #pluralize = null;

  constructor(fbApp, db, pluralize) {
    this.#fbApp = fbApp;
    this.#db = db;
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
    const obj = Spark.expand(res.data());
    return new Spark(this, validators, obj);
  }

  async find(type, validators, filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    var query = doc.where("meta:type", "==", type);
    filters.forEach(filter => {
      // query = query.where(filter.field, filter.op, filter.value);
      query = query.where(`${filter[0]}:${filter[1]}`, filter[2], filter[3]);
    });
    const res = await query.get();

    if (res.empty) {
      return null;
    } else if (res.size == 1) {
      const obj = Spark.expand(res.docs[0].data());
      return new Spark(this, validators, obj);
    } else {
      throw new FlameError(`More than one Sparks match the given filters`);
    }
  }

  async list(type, validators, pageSize, pageNo, orderBy, fields, filters) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection);

    var query = doc.where("meta:type", "==", type);
    filters.forEach(filter => {
      // query = query.where(filter.field, filter.op, filter.value);
      query = query.where(`${filter[0]}:${filter[1]}`, filter[2], filter[3]);
    });
    if (orderBy !== null) {
      query = query.orderBy(...orderBy);
    }
    if (fields !== null) {
      query = query.select(...fields);
    }
    query = query.limit(pageSize).offset(pageSize * pageNo);
    const res = await query.get();
    const docs = res.docs.map(doc => Spark.expand(doc.data()));
    // TODO: use withConverter - https://googleapis.dev/nodejs/firestore/latest/Query.html#withConverter
    return fields !== null ? docs : docs.map(doc => new Spark(this, validators, doc));
  }

  async insert(spark) {
    const doc = this.#docRef(spark.meta);
    try {
      const obj = spark.collapse();
      const nowIso8601 = (new Date()).toISOString();
      obj["meta:createdAt"] = nowIso8601;
      obj["meta:modifiedAt"] = nowIso8601;
      await doc.create(obj);
    } catch(err) {
      if (err.code === 6) { // "already-exists"
        throw new FlameError(`Spark '${spark.meta.id}' for shape '${spark.meta.type}' already exists`);
      } else {
        throw err;
      }
    }
  }

  batchInsert(fsBatch, spark) {
    const doc = this.#docRef(spark.meta);
    const obj = spark.collapse();
    const nowIso8601 = (new Date()).toISOString();
    obj["meta:createdAt"] = nowIso8601;
    obj["meta:modifiedAt"] = nowIso8601;
    fsBatch.create(doc, obj);
  }

  async update(fragments) {
    const meta = fragments.meta;
    const doc = this.#docRef(meta);
    try {
      const obj = fragments.collapse();
      obj["meta:modifiedAt"] = (new Date()).toISOString();
      await doc.update(obj);
    } catch(err) {
      if (err.code === 5) { // "not-fouund"
        throw new FlameError(`Spark '${meta.id}' for shape '${meta.type}' not found`);
      } else {
        throw err;
      }
    }
  }

  batchUpdate(fsBatch, fragments) {
    const meta = fragments.meta;
    const doc = this.#docRef(meta);
    const obj = fragments.collapse();
    obj["meta:modifiedAt"] = (new Date()).toISOString();
    fsBatch.update(doc, obj);
  }

  async upsert(spark) {
    const doc = this.#docRef(spark.meta);
    const obj = spark.collapse();
    const nowIso8601 = (new Date()).toISOString();
    obj["meta:createdAt"] = nowIso8601;
    obj["meta:modifiedAt"] = nowIso8601;
    await doc.set(obj);
  }

  batchUpsert(fsBatch, spark) {
    const doc = this.#docRef(spark.meta);
    const obj = spark.collapse();
    const nowIso8601 = (new Date()).toISOString();
    obj["meta:createdAt"] = nowIso8601;
    obj["meta:modifiedAt"] = nowIso8601;
    fsBatch.set(doc, obj);
  }

  async remove(type, id) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);

    await doc.delete();
  }

  batchRemove(fsBatch, type, id) {
    const collection = this.#collection(type);
    const doc = this.#db.collection(collection).doc(id);
    fsBatch.delete(doc);
  }

  async writeBatch(b) {
    const fsBatch = this.#db.batch();
    b.writes().forEach(w => {
      const op = w[0];
      if (op === "insert") {
        this.batchInsert(fsBatch, w[1]);
      } else if (op === "upsert") {
        this.batchUpsert(fsBatch, w[1]);
      } else if (op === "update") {
        this.batchUpdate(fsBatch, w[1]);
      } else if (op === "remove") {
        this.batchRemove(fsBatch, w[1], w[2]);
      } else {
        throw new FlameError(`Unknown batch-write operation '${op}'`);
      }
    });
    await fsBatch.commit();
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
