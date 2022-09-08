(function() {
  var FBA, FS, FirebaseApp;

  FBA = require('firebase-admin');

  FS = require('firebase-admin/firestore');

  FirebaseApp = class FirebaseApp {
    async create(_name, _config) {
      var db, fb_cfg, fba;
      fb_cfg = {
        credential: FBA.credential.cert(_config.service_account),
        databaseURL: `https://${_config.project_id}.firebaseio.com`
      };
      fba = (await FBA.initializeApp(fb_cfg, _name));
      db = FS.getFirestore(fba);
      return {fba, db};
    }

  };

  module.exports = FirebaseApp;

}).call(this);
