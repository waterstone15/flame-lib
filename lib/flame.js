(function() {
  var Adapter, Configuration, Flame, Shape, all, map;

  Adapter = require('./adapter');

  Configuration = require('./configuration');

  Shape = require('./shape');

  map = require('lodash/map');

  ({all} = require('rsvp'));

  Flame = class Flame {
    constructor(_app, _opts = {}) {
      this.adapter = new Adapter(_app);
      this.app = _app;
      this.config = new Configuration(_opts);
      return;
    }

    wildfire() {
      return this.app.fba;
    }

    async erase(_collection) {
      var db, qs, ref;
      db = this.wildfire().firestore();
      qs = (await db.collection(_collection).get());
      await all(map((ref = qs.docs) != null ? ref : [], async function(ds) {
        await db.doc(`${_collection}/${ds.id}`).delete();
      }));
      return true;
    }

    async transact(_f) {
      return (await this.adapter.transact(_f));
    }

    model() {
      return this.shape(...arguments);
    }

    shape(_type, _obj, _opts = {}) {
      var config;
      config = this.config.extend(_opts);
      return new Shape(this.adapter, _type, _obj, config);
    }

  };

  module.exports = Flame;

}).call(this);
