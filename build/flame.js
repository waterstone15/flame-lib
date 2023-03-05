(function() {
  var Adapter, FAA, Flame, Settings, Shape, all, map;

  Adapter = require('./adapter');

  Settings = require('./settings');

  FAA = require('./firebase-admin-app');

  Shape = require('./shape');

  map = require('lodash/map');

  ({all} = require('rsvp'));

  Flame = (function() {
    class Flame {
      constructor(_name, _config = {}) {
        this.adapter = new Adapter(_name);
        this.name = _name;
        this.settings = new Settings(_config);
        return;
      }

      wildfire() {
        return this.app.fba;
      }

      async erase(_collection) {
        var db, qs, ref;
        db = this.wildfire().firestore();
        qs = (await db.collection(_collection).get());
        (await all(map((ref = qs.docs) != null ? ref : [], async function(ds) {
          await db.doc(`${_collection}/${ds.id}`).delete();
        })));
        return true;
      }

      async transact(_f) {
        return (await this.adapter.transact(_f));
      }

      shape() {
        return this.model(...arguments);
      }

      model(_type, _obj, _settings = {}) {
        var settings;
        settings = this.settings.extend(_settings);
        return new Shape(this.adapter, _type, _obj, settings);
      }

    };

    Flame.prototype.FV = FAA.prototype.FV;

    return Flame;

  }).call(this);

  module.exports = Flame;

}).call(this);
