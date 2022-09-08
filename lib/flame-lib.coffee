FirebaseApp   = require './firebase-app'
Flame         = require './flame'
FlameError    = require './flame-error'
isEmpty       = require 'lodash/isEmpty'


class FlameLib

  apps = {}
  flames = {}
  options = {}

  register: (_opts) ->
    for name, opt of _opts
      if !isEmpty(options[name])
        throw new FlameError("'#{name}' is already registered in Flame.")
      options[name] = opt
    return

  init: (_name) ->
    app = apps[_name]
    if !app
      { fba, db } = await FirebaseApp::create(_name, options[_name])
      apps[_name] = { fba, db }
    return

  ignite: (_name) ->
    await @init(_name)
    flames[_name] = new Flame(apps[_name], options[_name])
    return flames[_name]

  quench: (_name) ->
    if apps[_name]
      await apps[_name].db.terminate()
      await apps[_name].fba.delete()
      delete apps[_name]
      delete options[_name]
      delete flames[_name]
    return


FL = new FlameLib()

module.exports = FL
