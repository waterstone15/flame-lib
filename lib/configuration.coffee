includes     = require 'lodash/includes'
intersection = require 'lodash/intersection'
isArray      = require 'lodash/isArray'
isBoolean    = require 'lodash/isBoolean'
isEmpty      = require 'lodash/isEmpty'
isString     = require 'lodash/isString'
keys         = require 'lodash/keys'
merge        = require 'lodash/merge'
pick         = require 'lodash/pick'
reduce       = require 'lodash/reduce'

class Configuration

  df =
    field_case: 'snake'
    field_case_db: 'kebab'
    fields: [ 'collection', 'created_at', 'deleted', 'deleted_at', 'id', 'idempotency_key', 'type', 'updated_at', 'v', ]
    group: true
    groups: [ 'meta', 'ext', 'index', 'rel', 'val', ]
    pluralize: true
    separator: ':'
    type_case: 'pascal'
    type_case_db: 'kebab'

  ok_cases = [ 'camel', 'kebab', 'pascal', 'snake', ]
  ok_separators = [ ':' ]

  isStrings = (_gs) ->
    return (
      !isEmpty(_gs) &&
      isArray(_gs) &&
      reduce(_gs, ((_r, _g) -> _r && isString(_g)), true)
    )


  constructor: (_o) ->
    @fields        = if isStrings(_o.fields)                  then intersection(df.fields, _o.fields) else df.fields
    @field_case    = if includes(ok_cases, _o.field_case)     then _o.field_case                      else df.field_case
    @field_case_db = if includes(ok_cases, _o.field_case_db)  then _o.field_case_db                   else df.field_case_db
    @group         = if isBoolean(_o.group)                   then _o.group                           else df.group
    @separator     = if includes(ok_separators, _o.separator) then _o.separator                       else df.separator
    @groups        = if isStrings(_o.groups)                  then _o.groups                          else df.groups
    @pluralize     = if isBoolean(_o.pluralize)               then _o.pluralize                       else df.pluralize
    @type_case     = if includes(ok_cases, _o.type_case)      then _o.type_case                       else df.type_case
    @type_case_db  = if includes(ok_cases, _o.type_case_db)   then _o.type_case_db                    else df.type_case_db
    return

  extend: (_o)->
    return new Configuration(merge(pick(this, keys(df)), _o))


module.exports = Configuration