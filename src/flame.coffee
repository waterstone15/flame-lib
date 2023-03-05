Adapter  = require './adapter'
Settings = require './settings'
FAA      = require './firebase-admin-app'
Shape    = require './shape'

map      = require 'lodash/map'
{ all }  = require 'rsvp'


class Flame

  FV: FAA::FV

  constructor: (_name, _config = {}) ->
    @.adapter  = (new Adapter _name)
    @.name     = _name
    @.settings = (new Settings _config)
    return


  wildfire: ->
    return @app.fba


  erase: (_collection) ->
    db = @.wildfire().firestore()
    qs = await db.collection(_collection).get()
    (await all (map (qs.docs ? []), (ds) ->
      await db.doc("#{_collection}/#{ds.id}").delete()
      return
    ))
    return true


  transact: (_f) ->
    return (await @.adapter.transact _f)


  shape: -> (@.model arguments...)
  model: (_type, _obj, _settings = {}) ->
    settings = (@.settings.extend _settings)
    return (new Shape @.adapter, _type, _obj, settings)


module.exports = Flame

