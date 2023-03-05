(function() {
  var FBA, FS, FirebaseAdminApp, FlameE, includes, isFunction, map;

  FBA = require('firebase-admin');

  FlameE = require('./flame-error');

  FS = require('firebase-admin/firestore');

  includes = require('lodash/includes');

  isFunction = require('lodash/isFunction');

  map = require('lodash/map');

  FirebaseAdminApp = (function() {
    class FirebaseAdminApp {
      fba() {
        this.init();
        return FS.FieldValue;
      }

      async init(_name, _config = {}) {
        var FASA, cfg, cred, db, exists, fba, names, sa;
        sa = _config.service_account;
        FASA = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
        if (isFunction(sa)) {
          (sa = (await sa()));
        }
        if (!sa && !!FASA) {
          (sa = JSON.parse(FASA));
        }
        names = map(FBA.apps, (function(_a) {
          return _a.name;
        }));
        exists = includes(names, _name);
        if (!exists && sa) {
          cred = FBA.credential.cert(sa);
          cfg = {
            credential: cred,
            databaseURL: `https://${cred.projectId}.firebaseio.com`
          };
          FBA.initializeApp(cfg, _name);
        }
        if (!exists && !sa) {
          FBA.initializeApp();
        }
        fba = FBA.app(_name);
        db = FS.getFirestore(fba);
        return {
          fba,
          db,
          FV: FS.FieldValue
        };
      }

    };

    FirebaseAdminApp.prototype.FV = FS.FieldValue;

    return FirebaseAdminApp;

  }).call(this);

  module.exports = FirebaseAdminApp;

  (async function() {
    var faa, fac, qs, ref;
    fac = (ref = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) != null ? ref : '{}';
    faa = (await FirebaseAdminApp.prototype.init());
    // faa = (await FirebaseAdminApp::init 'main')
    // faa = (await FirebaseAdminApp::init 'main', { service_account: (JSON.parse fac) })
    qs = (await faa.db.collection('test').get());
    return console.log(qs.docs.length);
  })();

}).call(this);
