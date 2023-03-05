intersection = require 'lodash/intersection'
pick         = require 'lodash/pick'


class Spark


  constructor: (_data, _shape) ->
    @.shape = _shape
    @.data  = (_shape.serializer.normalize (pick _data, (_shape.serializer.paths _shape.data)))
    @.spark = (_shape.obj @.data)
    return


  errors: (_fields) ->
    return (@.shape.errors @.spark, _fields)


  save: ->
    return (@.shape.save @.spark)


  obj: (_fields) ->
    return (@.shape.obj @.spark, _fields)


  valid: -> (@.ok arguments...)
  ok: (_fields) ->
    return (@.shape.ok @.spark, _fields)


  del: ->
    return (@.shape.del @.spark)


  update: (_fields = []) ->
    if _fields == []
      return null
    all_fields = (@.shape.serializer.paths @.shape.data)
    return (@.shape.update @.spark, (intersection all_fields, _fields))


module.exports = Spark
