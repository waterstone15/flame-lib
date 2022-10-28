cloneDeep    = require 'lodash/cloneDeep'
every        = require 'lodash/every'
FlameError   = require './flame-error'
forEach      = require 'lodash/forEach'
get          = require 'lodash/get'
intersection = require 'lodash/intersection'
isArray      = require 'lodash/isArray'
isBoolean    = require 'lodash/isBoolean'
isEmpty      = require 'lodash/isEmpty'
isEqual      = require 'lodash/isEqual'
isFunction   = require 'lodash/isFunction'
includes     = require 'lodash/includes'
isString     = require 'lodash/isString'
map          = require 'lodash/map'
merge        = require 'lodash/merge'
omit         = require 'lodash/omit'
pick         = require 'lodash/pick'
random       = require '@stablelib/random'
Serializer   = require './serializer'
set          = require 'lodash/set'
Spark        = require './spark'
{ DateTime } = require 'luxon'


class Shape


  constructor: (_adapter, _type, _obj, _config) ->
    @adapter    = _adapter
    @config     = _config
    @serializer = new Serializer(_config)

    defaultValidator = (_d) -> true
    default_validators = {}
    forEach(@serializer.paths(_obj.data), (_p) ->
      if !isFunction(get(_obj, "validators.#{_p}")) then set(_obj, "validators.#{_p}", defaultValidator)
      return
    )

    validatorsOk = every(@serializer.paths(_obj.validators), (_p) ->
      v = get(_obj.validators, _p)
      return isFunction(v) && v.length == 1
    )
    if !validatorsOk
      throw new FlameError('Every validator must be a function that takes one argument.')
      return

    @collection = @serializer.collectionCasing(_type)
    @data       = @serializer.normalize(merge(@defaultData(), _obj.data))
    @type       = @serializer.typeCasingDB(_type)
    @validators = @serializer.normalize(merge(@defaultValidators(), _obj.validators))
    return


  defaultData: ->
    df =
      collection:      (_o) => @collection
      created_at:      (_o) => DateTime.local().setZone('utc').toISO()
      deleted:         (_o) => false
      deleted_at:      (_o) => null
      id:              (_o) => "#{@type}-#{random.randomString(32)}"
      idempotency_key: (_o) => null
      type:            (_o) => @type
      updated_at:      (_o) => null
      v:               (_o) => '1.0.0'
    if @config.group
      df = { meta: df }

    fs = map(@config.fields, (_f) =>
      return if @config.group then "meta.#{_f}" else _f
    )
    return pick(df, fs)


  defaultValidators: ->
    df =
      collection:      (_v) -> !isEmpty(_v) && isString(_v)
      created_at:      (_v) -> (_v == null) || (!isEmpty(_v) && isString(_v))
      deleted:         (_v) -> isBoolean(_v)
      deleted_at:      (_v) -> (_v == null) || (!isEmpty(_v) && isString(_v))
      id:              (_v) -> !isEmpty(_v) && isString(_v)
      idempotency_key: (_v) -> isEmpty(_v) || (!isEmpty(_v) && isString(_v))
      type:            (_v) -> !isEmpty(_v) && isString(_v)
      updated_at:      (_v) -> (_v == null) || (!isEmpty(_v) && isString(_v))
      v:               (_v) -> !isEmpty(_v) && isString(_v)
    if @config.group
      df = { meta: df }

    return pick(df, @defaultPaths())


  defaultPaths: ->
    return map(@config.fields, (_f) =>
      return if @config.group then "meta.#{_f}" else _f
    )


  extend: (_type, _obj, _opts = {}) ->
    obj = merge(
      { data: omit(cloneDeep(@data), @defaultPaths()) },
      { validators: omit(cloneDeep(@validators), @defaultPaths()) },
      _obj
    )
    config = @config.extend(_opts)
    return new Shape(@adapter, _type, obj, config)


  errors: (_data, _fields) ->
    fields = @serializer.paths(@data)
    (fields = intersection(fields, _fields)) if isArray(_fields)

    obj = @obj(_data, _fields)
    errors = {}
    for _f in fields
      fn = get(@validators, _f)
      kk = fn(get(obj, _f))
      set(errors, _f, !kk) if !kk
    return errors


  obj: (_data, _fields) ->
    fields = @serializer.paths(@data)
    (fields = intersection(fields, _fields)) if isArray(_fields)

    d = merge(cloneDeep(@data), _data)
    for _f in fields
      fn = get(d, _f)
      set(d, _f, fn(d)) if isFunction(fn)
    return pick(d, fields)


  ok: (_data, _fields) ->
    return isEmpty(@errors(_data, _fields))


  save: (_data) ->
    if !@ok(_data)
      return null
    obj = @obj(_data)

    collection = if @config.group then obj.meta.collection else obj.collection
    id = if @config.group then obj.meta.id else obj.id
    collapsed = @serializer.collapse(obj)

    writable = @adapter.save(collection, id, collapsed)
    return writable

  getAll: (_ids) ->
    readable = @adapter.getAll(@collection, _ids, this)
    return readable

  get: (_id) ->
    readable = @adapter.get(@collection, _id, this)
    return readable


  update: (_data, _fields) ->
    if !@ok(_data, _fields) || _fields == null
      return null

    obj = @obj(_data)
    updates = @obj(_data, _fields)

    if includes(@config.fields, 'updated_at')
      now = DateTime.local().setZone('utc').toISO()
      path = (if @config.group then 'meta.' else '') + @serializer.fieldCasing('updated_at')
      set(updates, path, now)

    collection = if @config.group then obj.meta.collection else obj.collection
    id = if @config.group then obj.meta.id else obj.id
    collapsed = @serializer.collapse(updates)

    writable = @adapter.update(collection, id, collapsed)
    return writable


  remove: -> @del(arguments...)
  del: (_data) ->
    obj = @obj(_data)
    collection = if @config.group then obj.meta.collection else obj.collection
    id = if @config.group then obj.meta.id else obj.id

    writable = @adapter.del(collection, id)
    return writable


  create: -> @spark(arguments...)
  spark: (_data) ->
    return new Spark(_data, this)


  findOne: -> @find(arguments...)
  find: (_constraints, _fields) ->
    readable = @adapter.find(@collection, _constraints, this, _fields)
    return readable


  findAll: -> @list(arguments...)
  list: (_constraints) ->
    readable = @adapter.list(@collection, _constraints, this)
    return readable


  page: (_opts) ->
    readable = @adapter.page(_opts, @collection, this)
    return readable


  # addQuery: ->


  # q: ->

module.exports = Shape
