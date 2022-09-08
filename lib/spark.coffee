intersection = require 'lodash/intersection'
pick         = require 'lodash/pick'


class Spark


  constructor: (_data, @shape) ->
    @data = @shape.serializer.normalize(pick(_data, @shape.serializer.paths(@shape.data)))
    return


  errors: (_fields) ->
    return @shape.errors(@data, _fields)


  save: ->
    return @shape.save(@data)


  obj: (_fields) ->
    return @shape.obj(@data, _fields)


  ok: (_fields) ->
    return @shape.ok(@data, _fields)


  del: ->
    return @shape.del(@data)


  update: (_fields = []) ->
    if _fields == []
      return null
    all_fields = @shape.serializer.paths(@shape.data)
    return @shape.update(@data, intersection(all_fields, _fields))


module.exports = Spark
