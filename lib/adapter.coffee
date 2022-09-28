camelCase  = require 'lodash/camelCase'
cloneDeep  = require 'lodash/cloneDeep'
filter     = require 'lodash/filter'
first      = require 'lodash/first'
get        = require 'lodash/get'
includes   = require 'lodash/includes'
isArray    = require 'lodash/isArray'
isEmpty    = require 'lodash/isEmpty'
isInteger  = require 'lodash/isInteger'
last       = require 'lodash/last'
map        = require 'lodash/map'
pick       = require 'lodash/pick'
reverse    = require 'lodash/reverse'


class Adapter

  ok_comparators = [ '<', '<=', '==', '>' , '>=', '!=', 'array-contains', 'array-contains-any', 'in', 'not-in' ]

  constructor: (_app) ->
    @db  = _app.db
    @fba = _app.fba


  save: (_collection, _id, _data) ->
    writeable =
      data: _data
      doc_ref: @db.collection(_collection).doc(_id)
      type: 'create'
      write: ->
        try
          await @doc_ref.create(_data)
          return true
        catch err
          console.log err
          (->)()
        return false
    return writeable


  getAll: (_collection, _ids, _shape) ->
    readable =
      collection: _collection
      doc_refs: map(_ids, (_id) => @db.collection(_collection).doc(_id))
      db: @db
      type: 'getAll'
      read: ->
        try
          dss = await @db.getAll(@doc_refs...)
          if !isEmpty(dss)
            expanded = map(dss, (_ds) -> _shape.serializer.expand(_ds.data()))
            return expanded
        catch err
          console.log err
          (->)()
        return null


  get: (_collection, _id, _shape) ->
    readable =
      collection: _collection
      doc_ref: @db.collection(_collection).doc(_id)
      id: _id
      type: 'get'
      read: ->
        try
          ds = await @doc_ref.get()
          if ds.exists
            expanded = _shape.serializer.expand(ds.data())
            return expanded
        catch err
          console.log err
          (->)()
        return null


  update: (_collection, _id, _data) ->
    writeable =
      data: _data
      doc_ref: @db.collection(_collection).doc(_id)
      type: 'update'
      write: ->
        try
          await @doc_ref.update(_data)
          return true
        catch err
          console.log err
          (->)()
        return false
    return writeable


  del: (_collection, _id) ->
    writeable =
      doc_ref: @db.collection(_collection).doc(_id)
      type: 'delete'
      write: ->
        try
          await @doc_ref.delete()
          return true
        catch err
          console.log err
          (->)()
        return false
    return writeable


  find: (_collection, _constraints = [], _shape, _fields = []) ->
    query = @db.collection(_collection)
    for c in _constraints
      [ type, rest... ] = c
      if includes([ 'order-by', 'where', ], type)
        rest[0] = _shape.serializer.pathCasingDB(rest[0])
        query = query[camelCase(type)](rest...)
    query = query.limit(1)

    readable =
      query: query
      type: 'find'
      read: ->
        try
          qs = await @query.get()
          if !qs.emppty
            expanded = _shape.serializer.expand(qs.docs[0].data())
            (expanded = pick(expanded, _fields)) if !isEmpty(_fields)
            return expanded
        catch err
          console.log err
          (->)()
        return null

    return readable


  list: (_collection, _constraints = [], _shape) ->
    query = @db.collection(_collection)
    for c in _constraints
      [ type, rest... ] = c
      if includes([ 'select' ], type)
        rest = map(rest, (_p) -> _shape.serializer.pathCasingDB(_p))
        query = query[camelCase(type)](rest...)
      if includes([ 'order-by', 'where', ], type)
        rest[0] = _shape.serializer.pathCasingDB(rest[0])
        query = query[camelCase(type)](rest...)
      if includes([ 'end-at', 'end-before', 'limit', 'start-after', 'start-at', ], type)
        query = query[camelCase(type)](rest...)

    readable =
      query: query
      type: 'list'
      read: ->
        try
          qs = await @query.get()
          if !qs.emppty
            return map(qs.docs, (ds) ->
              expanded = _shape.serializer.expand(ds.data())
              return expanded
            )
        catch err
          console.log err
          (->)()
        return null

    return readable

  # end at 'm' = start at 'm', flip 'asc' / 'desc', and reverse list
  # end before 'm' = start after 'm', flip 'asc' / 'desc', and reverse list
  page: (_opts, _collection, _shape) ->

    readable =
      type: 'page'
      read: =>
        csts = if isArray(_opts.constraints) then _opts.constraints else []
        coll_first_csts = cloneDeep(csts)
        coll_last_csts = cloneDeep(csts)

        if !isEmpty(get(_opts, 'order_by.field'))
          direction = if includes([ 'asc', 'desc' ], get(_opts, 'order_by.direction')) then _opts.order_by.direction else 'asc'
          csts.push([ 'order-by', _opts.order_by.field, direction ])
          coll_first_csts.push([ 'order-by', _opts.order_by.field, direction ])
          coll_last_csts.push([ 'order-by', _opts.order_by.field, (if direction == 'asc' then 'desc' else 'asc') ])

        if !isEmpty(_opts.cursor)
          value = _opts.cursor.value
          (value = await @db.collection(_collection).doc(_opts.cursor.value).get()) if (_opts.cursor.type == 'id')
          start = if (_opts.cursor.inclusive == true) then 'start-at' else 'start-after'
          csts.push([ start, value ])

        if !isEmpty(_opts.fields) && isArray(_opts.fields)
          csts.push([ 'select', ..._opts.fields ])
          coll_first_csts.push([ 'select', ..._opts.fields ])
          coll_last_csts.push([ 'select', ..._opts.fields ])

        if (isInteger(_opts.size) && _opts.size > 0)
          csts.push([ 'limit', _opts.size ])

        coll_first_csts = filter(coll_first_csts, (_c) -> !includes([ 'end-before', 'end-at', 'start-after', 'start-at', 'limit' ], _c[0]))
        coll_last_csts = filter(coll_last_csts, (_c) -> !includes([ 'end-before', 'end-at', 'start-after', 'start-at', 'limit' ], _c[0]))

        items = await this.list(_collection, csts, _shape).read()
        coll_first = await this.find(_collection, coll_first_csts, _shape, _opts.fields).read()
        coll_last = await this.find(_collection, coll_last_csts, _shape, _opts.fields).read()
        if get(_opts, 'order_by.direction') == 'desc'
          items = reverse(items)
          [ coll_first, coll_last ] = [ coll_last, coll_first ]

        return {
          collection:
            first: coll_first
            last: coll_last
          page:
            first: first(items)
            items: items
            last: last(items)
        }

    return readable


  # batch: (writeables) ->


  # transaction: (fn) ->


module.exports = Adapter
