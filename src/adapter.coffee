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
nth        = require 'lodash/nth'
pick       = require 'lodash/pick'
reverse    = require 'lodash/reverse'
sortBy     = require 'lodash/sortBy'
take       = require 'lodash/take'
{ all }    = require 'rsvp'

class Adapter

  ok_comparators = [ '<', '<=', '==', '>' , '>=', '!=', 'array-contains', 'array-contains-any', 'in', 'not-in' ]

  constructor: (_app) ->
    @.db  = _app.db
    @.fba = _app.fba


  transact: (_f) ->
    try
      result = await @.db.runTransaction((_t) -> await _f(_t))
      return result
    catch err
      console.log err
      return null


  save: (_collection, _id, _data) ->
    writeable =
      data: _data
      doc_ref: @.db.collection(_collection).doc(_id)
      type: 'create'
      write: (_t) ->
        if _t
          return await @.writeT(_t)
        try
          await @.doc_ref.create(_data)
          return true
        catch err
          console.log err
          (->)()
        return false
      writeT: (_t) ->
        await _t.create(@.doc_ref, _data)
        return true
    return writeable


  getAll: (_collection, _ids, _shape, _fields) ->
    readable =
      collection: _collection
      doc_refs: map(_ids, (_id) => @.db.collection(_collection).doc(_id))
      db: @.db
      type: 'getAll'
      read: ->
        try
          dss = await @.db.getAll(@.doc_refs...)
          if !isEmpty(dss)
            expanded = map(dss, (_ds) ->
              ex = _shape.serializer.expand(_ds.data())
              (ex = pick(ex, _fields)) if !isEmpty(_fields)
              return ex
            )
            return expanded
        catch err
          console.log err
          (->)()
        return null


  get: (_collection, _id, _shape, _fields) ->
    readable =
      collection: _collection
      doc_ref: @.db.collection(_collection).doc(_id)
      id: _id
      type: 'get'
      read: (_t) ->
        if _t
          return await @.readT(_t)
        try
          ds = await @.doc_ref.get()
          if ds.exists
            expanded = _shape.serializer.expand(ds.data())
            (expanded = pick(expanded, _fields)) if !isEmpty(_fields)
            return expanded
        catch err
          console.log err
          (->)()
        return null
      readT: (_t) ->
        ds = await _t.get(@.doc_ref)
        if ds.exists
          expanded = _shape.serializer.expand(ds.data())
          (expanded = pick(expanded, _fields)) if !isEmpty(_fields)
          return expanded
        return null


  update: (_collection, _id, _data) ->
    writeable =
      data: _data
      doc_ref: @.db.collection(_collection).doc(_id)
      type: 'update'
      write: (_t) ->
        if _t
          return await @.writeT(_t)
        try
          await @.doc_ref.update(_data)
          return true
        catch err
          console.log err
          (->)()
        return false
      writeT: (_t) ->
        await _t.update(@.doc_ref, _data)
        return true

    return writeable


  del: (_collection, _id) ->
    writeable =
      doc_ref: @.db.collection(_collection).doc(_id)
      type: 'delete'
      write: (_t) ->
        if _t
          return await @.writeT(_t)
        try
          await @.doc_ref.delete()
          return true
        catch err
          console.log err
          (->)()
        return false
      writeT: (_t) ->
        await t.delete(@.doc_ref)
        return true
    return writeable


  findOne: -> @.find(arguments...)
  find: (_collection, _constraints = [], _shape, _fields = []) ->
    query = @.db.collection(_collection)
    for c in _constraints
      [ type, rest... ] = c
      if includes([ 'order-by', 'where', ], type)
        rest[0] = _shape.serializer.pathCasingDB(rest[0])
        query = query[camelCase(type)](rest...)
      if includes([ 'end-at', 'end-before', 'start-after', 'start-at', ], type)
        query = query[camelCase(type)](rest...)
    query = query.limit(1)

    readable =
      query: query
      type: 'find'
      read: (_t) ->
        if _t
          return await @.readT(_t)
        try
          qs = await @.query.get()
          if !qs.empty
            expanded = _shape.serializer.expand(qs.docs[0].data())
            (expanded = pick(expanded, _fields)) if !isEmpty(_fields)
            return expanded
        catch err
          console.log err
          (->)()
        return null
      readT: (_t) ->
        qs = await _t.get(@.query)
        if !qs.empty
          expanded = _shape.serializer.expand(qs.docs[0].data())
          (expanded = pick(expanded, _fields)) if !isEmpty(_fields)
          return expanded
        return null

    return readable


  findAll: -> @.list(arguments...)
  list: (_collection, _constraints = [], _shape) ->
    query = @.db.collection(_collection)
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
      read: (_t) ->
        if _t
          return await @.readT(_t)
        try
          qs = await @.query.get()
          if !qs.empty
            return map(qs.docs, (ds) ->
              expanded = _shape.serializer.expand(ds.data())
              return expanded
            )
        catch err
          console.log err
          (->)()
        return null
      readT: (_t) ->
        qs = await _t.get(@.query)
        if !qs.empty
          return map(qs.docs, (ds) ->
            expanded = _shape.serializer.expand(ds.data())
            return expanded
          )
        return null

    return readable

  
  page: (_opts, _collection, _shape) ->


    readable =
      type: 'page'
      read: =>
        ignore = [ 'end-before', 'end-at', 'limit', 'order-by', 'start-after', 'start-at',  ]
        Q = if isArray(_opts.constraints) then _opts.constraints else []
        Q = filter(Q, (_c) -> !includes(ignore, _c[0]))

        col_fstQ = cloneDeep(Q)
        col_lstQ = cloneDeep(Q)
        itemsQ   = cloneDeep(Q)
        prevQ    = cloneDeep(Q)
        nextQ    = cloneDeep(Q)
        

        cursor = if (!!_opts.cursor?.value) then _opts.cursor.value else null
        field  = if (!!_opts.sort?.field)   then _opts.sort?.field  else null

        at_end = if (_opts.cursor?.position == 'page-end') then true else false
        is_rev = if (_opts.sort?.order == 'high-to-low')   then true else false

        # nothing
        if !field && !cursor 
          (->)()

        # nonsense
        if !field && cursor
          (->)()
        
        # order-by
        if field && !cursor
          col_fstQ = [...col_fstQ, [ 'order-by', field, (if is_rev then 'desc' else 'asc') ]]
          col_lstQ = [...col_lstQ, [ 'order-by', field, (if is_rev then 'asc' else 'desc') ]]
          itemsQ   = [...itemsQ,   [ 'order-by', field, (if is_rev then 'desc' else 'asc') ]]

        # start-at, order-by
        if field && cursor
          cdoc = await @.db.collection(_collection).doc(cursor).get()
          
          col_fstQ = [...col_fstQ, [ 'order-by', field, (if is_rev then 'desc' else 'asc') ]]
          col_lstQ = [...col_lstQ, [ 'order-by', field, (if is_rev then 'asc' else 'desc') ]]
          
          itemsQ   = [...itemsQ,   [ 'order-by', field, (if is_rev then 'desc' else 'asc') ]]
          itemsQ   = [...itemsQ,   [ 'start-at', cdoc]]
          
          (nextQ   = [...nextQ,    [ 'order-by', field, 'asc'  ]]) if (!is_rev && at_end)
          (nextQ   = [...nextQ,    [ 'order-by', field, 'desc' ]]) if (is_rev && at_end)
          (nextQ   = [...nextQ,    [ 'start-after', cdoc ]]) if (at_end)
          
          (prevQ   = [...prevQ,    [ 'order-by', field, 'desc' ]]) if (!is_rev && !at_end) 
          (prevQ   = [...prevQ,    [ 'order-by', field, 'asc'  ]]) if (is_rev && !at_end)
          (prevQ   = [...prevQ,    [ 'start-after', cdoc ]]) if (!at_end)

        

        fields = if isArray(_opts.fields) then _opts.fields else []
        size   = if (isInteger(_opts.size) && _opts.size > 0) then _opts.size else 1

        if !isEmpty(fields)
          col_fstQ = [...col_fstQ, [ 'select', ...fields ]] 
          col_lstQ = [...col_lstQ, [ 'select', ...fields ]] 
          itemsQ   = [...itemsQ,   [ 'select', ...fields ]] 
          nextQ    = [...nextQ,    [ 'select', ...fields ]] 
          prevQ    = [...prevQ,    [ 'select', ...fields ]] 

        itemsQ = [...itemsQ, [ 'limit', (size + 1) ]]


        [ col_first, col_last, items, next, prev ] = await all([
          @.find(_collection, col_fstQ, _shape, fields).read()
          @.find(_collection, col_lstQ, _shape, fields).read()
          @.list(_collection, itemsQ, _shape).read()
          @.find(_collection, nextQ, _shape, fields).read()
          @.find(_collection, prevQ, _shape, fields).read()
        ])


        prev = switch
          when cursor && field && !at_end
            prev
          when at_end && items.length > size
            nth(items, -1) 
          else
            null

        next = switch
          when cursor && field && at_end
            next
          when !at_end && items.length > size
            nth(items, -1) 
          else
            null
        
        # items = sortBy(items, fields)
        # (items = reverse(items, fields)) if (field && is_rev)

        return {
          collection:
            first: col_first
            last: col_last
          next: next
          page:
            first: first(items)
            items: take(items, size)
            last: nth(items, (items.length - size - 1))
          prev: prev
        }

    return readable


module.exports = Adapter
