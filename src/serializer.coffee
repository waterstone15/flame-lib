camelCase    = require 'lodash/camelCase'
capitalize   = require 'lodash/capitalize'
flatten      = require 'lodash/flatten'
join         = require 'lodash/join'
kebabCase    = require 'lodash/kebabCase'
keys         = require 'lodash/keys'
map          = require 'lodash/map'
pluralize    = require 'pluralize'
replace      = require 'lodash/replace'
set          = require 'lodash/set'
snakeCase    = require 'lodash/snakeCase'
sortBy       = require 'lodash/sortBy'
split        = require 'lodash/split'


class Serializer


  casing =
    camel:  (_str) -> (camelCase _str)
    kebab:  (_str) -> (kebabCase _str)
    pascal: (_str) -> (capitalize (camelCase _str))
    snake:  (_str) -> (snakeCase _str)


  constructor: (_settings) ->
    @.settings = _settings


  collectionCasing: (_str) ->
    if @.settings.pluralize
      return (pluralize (@.typeCasingDB _str))
    else
      return (@.typeCasingDB _str)


  fieldCasing: (_str) ->
    return casing[@.settings.field_case](_str)


  fieldCasingDB: (_str) ->
    return casing[@.settings.field_case_db](_str)


  typeCasing: (_str) ->
    return casing[@.settings.type_case](_str)


  typeCasingDB: (_str) ->
    return casing[@.settings.type_case_db](_str)


  pathCasingDB: (_str) ->
    if @.settings.group
      [ group, tail... ] = (split _str, '.')
      key = (join tail, '.')
      return "#{(@.fieldCasingDB group)}#{@.settings.separator}#{(@.fieldCasingDB key)}"
    else
      (@.fieldCasingDB _str)


  normalize: (_obj) ->
    obj = {}
    if @.settings.group
      for _g in @.settings.groups
        for _k in keys(_obj[_g])
          (set obj, "#{(@.fieldCasing _g)}.#{(@.fieldCasing _k)}", _obj[_g][_k])
    else
      for _k in keys(_obj)
        obj[@.fieldCasing(_k)] = _obj[_k]
    return obj


  paths: (_obj) ->
    if @.settings.group
      return (sortBy (flatten (map @.settings.groups, (_g) ->
        (map keys(_obj[_g]), (_k) -> "#{_g}.#{_k}")
      )))
    else
      return (sortBy (keys _obj))


  expand: (_obj) ->
    obj = {}
    for _k in (keys _obj)
      if @.settings.group
        [ group ] = (split _k, @.settings.separator, 1)
        separator_escaped = (@.settings.separator.replace /[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
        tail = replace(_k, (new RegExp("[a-z]+(#{separator_escaped})")), '')
        key  = (join tail, '')
        (set obj, "#{(@.fieldCasing group)}.#{(@.fieldCasing key)}", _obj[_k])
      else
        obj[@.fieldCasing(_k)] = _obj[_k]
    return obj


  collapse: (_obj) ->
    obj = {}
    if @.settings.group
      for _g in @.settings.groups
        for _k in (keys _obj[_g])
          key = "#{(@.fieldCasingDB _g)}#{@.settings.separator}#{(@.fieldCasingDB _k)}"
          obj[key] = _obj[_g][_k]
    else
      for _k in (keys _obj)
        obj[(@.fieldCasingDB _k)] = _obj[_k]
    return obj


module.exports = Serializer
