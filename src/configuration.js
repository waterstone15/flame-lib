(function() {
  var Configuration, includes, intersection, isArray, isBoolean, isEmpty, isString, keys, merge, pick, reduce;

  includes = require('lodash/includes');

  intersection = require('lodash/intersection');

  isArray = require('lodash/isArray');

  isBoolean = require('lodash/isBoolean');

  isEmpty = require('lodash/isEmpty');

  isString = require('lodash/isString');

  keys = require('lodash/keys');

  merge = require('lodash/merge');

  pick = require('lodash/pick');

  reduce = require('lodash/reduce');

  Configuration = (function() {
    var df, isStrings, ok_cases, ok_separators;

    class Configuration {
      constructor(_o) {
        this.fields = isStrings(_o.fields) ? intersection(df.fields, _o.fields) : df.fields;
        this.field_case = includes(ok_cases, _o.field_case) ? _o.field_case : df.field_case;
        this.field_case_db = includes(ok_cases, _o.field_case_db) ? _o.field_case_db : df.field_case_db;
        this.group = isBoolean(_o.group) ? _o.group : df.group;
        this.separator = includes(ok_separators, _o.separator) ? _o.separator : df.separator;
        this.groups = isStrings(_o.groups) ? _o.groups : df.groups;
        this.pluralize = isBoolean(_o.pluralize) ? _o.pluralize : df.pluralize;
        this.type_case = includes(ok_cases, _o.type_case) ? _o.type_case : df.type_case;
        this.type_case_db = includes(ok_cases, _o.type_case_db) ? _o.type_case_db : df.type_case_db;
        return;
      }

      extend(_o) {
        return new Configuration(merge(pick(this, keys(df)), _o));
      }

    };

    df = {
      field_case: 'snake',
      field_case_db: 'kebab',
      fields: ['collection', 'created_at', 'deleted', 'deleted_at', 'id', 'idempotency_key', 'type', 'updated_at', 'v'],
      group: true,
      groups: ['meta', 'ext', 'index', 'rel', 'val'],
      pluralize: true,
      separator: '-',
      type_case: 'pascal',
      type_case_db: 'kebab'
    };

    ok_cases = ['camel', 'kebab', 'pascal', 'snake'];

    ok_separators = ['-', '--', ':', '::', '_'];

    isStrings = function(_gs) {
      return !isEmpty(_gs) && isArray(_gs) && reduce(_gs, (function(_r, _g) {
        return _r && isString(_g);
      }), true);
    };

    return Configuration;

  }).call(this);

  module.exports = Configuration;

}).call(this);
