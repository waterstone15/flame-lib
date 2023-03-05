FAA     = require './firebase-admin-app'
Flame   = require './flame'
FlameE  = require './flame-error'

forEach = require 'lodash/forEach'
isEmpty = require 'lodash/isEmpty'
keys    = require 'lodash/keys'
map     = require 'lodash/map'
{ all } = require 'rsvp'


class FlameLib

  apps    = {}
  configs = {}
  flames  = {}

  getApp:    (_name) -> apps[_name]
  getConfig: (_name) -> configs[_name]
  getFlame:  (_name) -> flames[_name]

  register: (_opts) ->
    for name, opt of _opts
      if !(isEmpty configs[name])
        throw new FlameE("'#{name}' is already registered in Flame.")
        return
      configs[name] = opt
    return

  init: (_name) ->
    app = apps[_name]
    if !app
      { fba, db, FV } = await (FAA::init _name, configs[_name])
      apps[_name] = { fba, db, FV }
    return

  ignite: (_name) ->
    if !configs[_name]
      throw (new FlameE "'#{_name}' is not registered in Flame.")
      return

    flames[_name] = (new Flame _name, _configs[_name])
    return flames[_name]

  quench: (_name) ->
    if apps[_name]
      await apps[_name].db.terminate()
      await apps[_name].fba.delete()
      delete apps[_name]

    if flames[_name]
      delete flames[_name]

    if configs[_name]
      delete configs[_name]
    return

  purge: ->
    (await all (map (keys configs), (_key) =>
      await (@.quench _key)
    ))
    return


FL = new FlameLib()

module.exports = FL


# (->
#   fac = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ? '{}'
#   f = await FirebaseAdminApp::init()
#   qs = await f.db.collection('test').get()
#   console.log qs.docs.length
#   FirebaseAdminApp::app('main')
#   FirebaseAdminApp::app('main', { service_account: (JSON.parse fac) } )
#   FirebaseAdminApp::app('main', { service_account: (JSON.parse fac) } )
# )()