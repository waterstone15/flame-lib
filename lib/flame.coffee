Adapter       = require './adapter'
cloneDeep     = require 'lodash/cloneDeep'
Configuration = require './configuration'
isArray       = require 'lodash/isArray'
isBoolean     = require 'lodash/isBoolean'
merge         = require 'lodash/merge'
Shape         = require './shape'


class Flame


  constructor: (_app, _opts = {}) ->
    @adapter = new Adapter(_app)
    @app = _app
    @config = new Configuration(_opts)
    return


  wildfire: ->
    return @app.fba


  shape: (_type, _obj, _opts = {}) ->
    config = @config.extend(_opts)
    return new Shape(@adapter, _type, _obj, config)


module.exports = Flame
