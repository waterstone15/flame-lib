FBA    = require 'firebase-admin'
FlameE = require './flame-error'
FS     = require 'firebase-admin/firestore'

includes   = require 'lodash/includes'
isFunction = require 'lodash/isFunction'
map        = require 'lodash/map'


class FirebaseAdminApp


  FV: FS.FieldValue


  fba: ->
    @.init()
    FS.FieldValue


  init: (_name, _config = {}) ->

    sa   = _config.service_account
    FASA = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT

    (sa = await sa()) if (isFunction sa)
    (sa = (JSON.parse FASA)) if (!sa && !!FASA)

    names  = (map FBA.apps, ((_a) -> _a.name))
    exists = (includes names, _name)

    if !exists && sa
      cred = (FBA.credential.cert sa)
      cfg =
        credential: cred
        databaseURL: "https://#{cred.projectId}.firebaseio.com"
      (FBA.initializeApp cfg, _name)
    
    if !exists && !sa
      FBA.initializeApp()

    fba = (FBA.app _name)
    db  = (FS.getFirestore fba)
    return { fba, db, FV: FS.FieldValue }  


module.exports = FirebaseAdminApp



(->
  fac = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ? '{}'
  faa = await FirebaseAdminApp::init()
  # faa = (await FirebaseAdminApp::init 'main')
  # faa = (await FirebaseAdminApp::init 'main', { service_account: (JSON.parse fac) })
  qs = await faa.db.collection('test').get()
  (console.log qs.docs.length)
)()