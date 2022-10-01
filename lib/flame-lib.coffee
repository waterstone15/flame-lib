FirebaseApp   = require './firebase-app'
Flame         = require './flame'
FlameError    = require './flame-error'
isEmpty       = require 'lodash/isEmpty'

VERSION = '0.0.4'


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
      { fba, db } = await FirebaseApp::create(_name, options[_name])
      apps[_name] = { fba, db }
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
    apps = {}
    flames = {}
    options = {}
    return


FL = new FlameLib()

module.exports = FL
