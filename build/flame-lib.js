(function() {
  var FAA, FL, Flame, FlameE, FlameLib, all, forEach, isEmpty, keys, map;

  FAA = require('./firebase-admin-app');

  Flame = require('./flame');

  FlameE = require('./flame-error');

  forEach = require('lodash/forEach');

  isEmpty = require('lodash/isEmpty');

  keys = require('lodash/keys');

  map = require('lodash/map');

  ({all} = require('rsvp'));

  FlameLib = (function() {
    var apps, configs, flames;

    class FlameLib {
      getApp(_name) {
        return apps[_name];
      }

      getConfig(_name) {
        return configs[_name];
      }

      getFlame(_name) {
        return flames[_name];
      }

      register(_opts) {
        var name, opt;
        for (name in _opts) {
          opt = _opts[name];
          if (!(isEmpty(configs[name]))) {
            throw new FlameE(`'${name}' is already registered in Flame.`);
            return;
          }
          configs[name] = opt;
        }
      }

      async init(_name) {
        var FV, app, db, fba;
        app = apps[_name];
        if (!app) {
          ({fba, db, FV} = (await (FAA.prototype.init(_name, configs[_name]))));
          apps[_name] = {fba, db, FV};
        }
      }

      ignite(_name) {
        if (!configs[_name]) {
          throw new FlameE(`'${_name}' is not registered in Flame.`);
          return;
        }
        flames[_name] = new Flame(_name, _configs[_name]);
        return flames[_name];
      }

      async quench(_name) {
        if (apps[_name]) {
          await apps[_name].db.terminate();
          await apps[_name].fba.delete();
          delete apps[_name];
        }
        if (flames[_name]) {
          delete flames[_name];
        }
        if (configs[_name]) {
          delete configs[_name];
        }
      }

      async purge() {
        (await all(map(keys(configs), async(_key) => {
          return (await (this.quench(_key)));
        })));
      }

    };

    apps = {};

    configs = {};

    flames = {};

    return FlameLib;

  }).call(this);

  FL = new FlameLib();

  module.exports = FL;

  // (->
//   fac = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ? '{}'
//   f = await FirebaseAdminApp::init()
//   qs = await f.db.collection('test').get()
//   console.log qs.docs.length
//   FirebaseAdminApp::app('main')
//   FirebaseAdminApp::app('main', { service_account: (JSON.parse fac) } )
//   FirebaseAdminApp::app('main', { service_account: (JSON.parse fac) } )
// )()

}).call(this);
