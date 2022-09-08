FBA = require 'firebase-admin'
FS  = require 'firebase-admin/firestore'

class FirebaseApp

  create: (_name, _config) ->
    fb_cfg =
      credential: FBA.credential.cert(_config.service_account)
      databaseURL: "https://#{_config.project_id}.firebaseio.com"

    fba = await FBA.initializeApp(fb_cfg, _name)
    db  = FS.getFirestore(fba)
    return { fba, db }

module.exports = FirebaseApp
