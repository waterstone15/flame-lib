base64 = require '@stablelib/base64'
fba    = require 'firebase-admin'
merge  = require 'lodash/merge'

module.exports = (->

  return (_config = {}) ->

    if !fba.apps.length
      config = merge({
        credential: fba.credential.cert(JSON.parse(base64.decode(process.env.FIREBASE_CONFIG_BASE64)))
        databaseURL: vault.secrets.kv.FIREBASE_DATABASE_URL
      }, _config)
      await fba.initializeApp(config)
    return fba

)()