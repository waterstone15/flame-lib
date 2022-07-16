const fba = require("firebase-admin");
const fs = require("firebase-admin/firestore");
const base64 = require("@stablelib/base64");


/*
 * Convenient wrapper around Firebase SDK.
 * Internal-only to Flame; not intended to be used directly by Flame's clients.
 */
class FirebaseApp {
  static async create(config, dbURL) {
    const fbCfg = FirebaseApp.#firebaseConfig(config, dbURL);
    const fbApp = fba.initializeApp(fbCfg);
    const db = fs.getFirestore(fbApp);
    return [fbApp, db];
  }

  static #firebaseConfig(config, dbURL) {
    return {
      // credential: fba.credential.cert(config),
      databaseURL: dbURL,
      ...config,
    };
  }
};


module.exports = FirebaseApp;
