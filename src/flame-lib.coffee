FirebaseApp   = require './firebase-app'
Flame         = require './flame'
FlameError    = require './flame-error'

forEach       = require 'lodash/forEach'
isEmpty       = require 'lodash/isEmpty'
keys          = require 'lodash/keys'
map           = require 'lodash/map'
{ all }       = require 'rsvp'


class FlameLib

  apps = {}
  flames = {}
  options = {}

  register: (_opts) ->
    for name, opt of _opts
      if !isEmpty(options[name])
        throw new FlameError("'#{name}' is already registered in Flame.")
        return
      options[name] = opt
    return

  init: (_name) ->
    app = apps[_name]
    if !app
      { fba, db, FV } = await FirebaseApp::create(_name, options[_name])
      apps[_name] = { fba, db, FV }
    return

  ignite: (_name) ->
    if !options[_name]
      throw new FlameError("'#{_name}' is not registered in Flame.")
      return

    await @init(_name)
    flames[_name] = new Flame(apps[_name], options[_name])
    return flames[_name]

  quench: (_name) ->
    if apps[_name]
      await apps[_name].db.terminate()
      await apps[_name].fba.delete()
      delete apps[_name]

    if flames[_name]
      delete flames[_name]

    if options[_name]
      delete options[_name]
    return

  purge: ->
    await all(map(keys(options), (_key) =>
      await @quench(_key)
    ))
    return


FL = new FlameLib()

module.exports = FL
