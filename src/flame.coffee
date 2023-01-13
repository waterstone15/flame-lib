Adapter       = require './adapter'
Configuration = require './configuration'
Shape         = require './shape'

map           = require 'lodash/map'
{ all }       = require 'rsvp'


class Flame


  constructor: (_app, _opts = {}) ->
    @adapter = new Adapter(_app)
    @app = _app
    @config = new Configuration(_opts)
    return


  FV: ->
    return @app.FV


  wildfire: ->
    return @app.fba


  erase: (_collection) ->
    db = @wildfire().firestore()
    qs = await db.collection(_collection).get()
    await all(map((qs.docs ? []), (ds) ->
      await db.doc("#{_collection}/#{ds.id}").delete()
      return
    ))
    return true


  transact: (_f) ->
    return await @adapter.transact(_f)


  model: -> @shape(arguments...)
  shape: (_type, _obj, _opts = {}) ->
    config = @config.extend(_opts)
    return new Shape(@adapter, _type, _obj, config)


module.exports = Flame
