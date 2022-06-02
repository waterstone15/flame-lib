each      = require 'lodash/each'
kebabCase = require 'lodash/kebabCase'
keys      = require 'lodash/keys'
mapKeys   = require 'lodash/mapKeys'
merge     = require 'lodash/merge'
replace   = require 'lodash/replace'
set       = require 'lodash/set'
snakeCase = require 'lodash/snakeCase'

flatten = (o) ->
  obj = {}
  each(keys(o), (k) ->
    obj = merge(obj, mapKeys(o[k], (v, kk) -> kebabCase("#{k}_#{kk}")))
  )
  return obj


expand = (o) ->
  obj = {}
  each(o, (v, k) ->
    key = replace(k, /\-(.*)/, '')
    sub = snakeCase(replace(k, /([^\-]*)\-/, ''))
    set(obj, "#{key}.#{sub}", v)
  )
  return obj