const fba = require("firebase-admin");
const base64 = require("@stablelib/base64");


/*
 * Convenient wrapper around Firebase SDK.
 * Internal-only to Flame; not intended to be used directly by Flame's clients.
 */
class FirebaseApp {
  static async create(config) {
    const fbCfg = FirebaseApp.#firebaseConfig(config);
    return await fba.initializeApp(fbCfg);
  }

  static #firebaseConfig(config) {
    const cert = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
    return {
      credential: fba.credential.cert(cert),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      ...config,
    };
  }
};


module.exports = FirebaseApp;
