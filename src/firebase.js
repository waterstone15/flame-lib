const fba = require("firebase-admin");
const base64 = require("@stablelib/base64");


/*
 * Convenient wrapper around Firebase SDK.
 * Internal-only to Flame; not intended to be used directly by Flame's clients.
 */
class FirebaseApp {
  static async create(config, dbURL, certificate) {
    const fbCfg = FirebaseApp.#firebaseConfig(config, dbURL, certificate);
    return await fba.initializeApp(fbCfg);
  }

  static #firebaseConfig(config, dbURL, certificate) {
    return {
      credential: fba.credential.cert(certificate),
      databaseURL: dbURL,
      ...config,
    };
  }
};


module.exports = FirebaseApp;
