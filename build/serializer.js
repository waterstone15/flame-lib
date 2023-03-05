(function() {
  var Serializer, camelCase, capitalize, flatten, join, kebabCase, keys, map, pluralize, replace, set, snakeCase, sortBy, split;

  camelCase = require('lodash/camelCase');

  capitalize = require('lodash/capitalize');

  flatten = require('lodash/flatten');

  join = require('lodash/join');

  kebabCase = require('lodash/kebabCase');

  keys = require('lodash/keys');

  map = require('lodash/map');

  pluralize = require('pluralize');

  replace = require('lodash/replace');

  set = require('lodash/set');

  snakeCase = require('lodash/snakeCase');

  sortBy = require('lodash/sortBy');

  split = require('lodash/split');

  Serializer = (function() {
    var casing;

    class Serializer {
      constructor(_settings) {
        this.settings = _settings;
      }

      collectionCasing(_str) {
        if (this.settings.pluralize) {
          return pluralize(this.typeCasingDB(_str));
        } else {
          return this.typeCasingDB(_str);
        }
      }

      fieldCasing(_str) {
        return casing[this.settings.field_case](_str);
      }

      fieldCasingDB(_str) {
        return casing[this.settings.field_case_db](_str);
      }

      typeCasing(_str) {
        return casing[this.settings.type_case](_str);
      }

      typeCasingDB(_str) {
        return casing[this.settings.type_case_db](_str);
      }

      pathCasingDB(_str) {
        var group, key, tail;
        if (this.settings.group) {
          [group, ...tail] = split(_str, '.');
          key = join(tail, '.');
          return `${this.fieldCasingDB(group)}${this.settings.separator}${this.fieldCasingDB(key)}`;
        } else {
          return this.fieldCasingDB(_str);
        }
      }

      normalize(_obj) {
        var _g, _k, i, j, k, len, len1, len2, obj, ref, ref1, ref2;
        obj = {};
        if (this.settings.group) {
          ref = this.settings.groups;
          for (i = 0, len = ref.length; i < len; i++) {
            _g = ref[i];
            ref1 = keys(_obj[_g]);
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              _k = ref1[j];
              set(obj, `${this.fieldCasing(_g)}.${this.fieldCasing(_k)}`, _obj[_g][_k]);
            }
          }
        } else {
          ref2 = keys(_obj);
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            _k = ref2[k];
            obj[this.fieldCasing(_k)] = _obj[_k];
          }
        }
        return obj;
      }

      paths(_obj) {
        if (this.settings.group) {
          return sortBy(flatten(map(this.settings.groups, function(_g) {
            return map(keys(_obj[_g]), function(_k) {
              return `${_g}.${_k}`;
            });
          })));
        } else {
          return sortBy(keys(_obj));
        }
      }

      expand(_obj) {
        var _k, group, i, key, len, obj, ref, separator_escaped, tail;
        obj = {};
        ref = keys(_obj);
        for (i = 0, len = ref.length; i < len; i++) {
          _k = ref[i];
          if (this.settings.group) {
            [group] = split(_k, this.settings.separator, 1);
            separator_escaped = this.settings.separator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            tail = replace(_k, new RegExp(`[a-z]+(${separator_escaped})`), '');
            key = join(tail, '');
            set(obj, `${this.fieldCasing(group)}.${this.fieldCasing(key)}`, _obj[_k]);
          } else {
            obj[this.fieldCasing(_k)] = _obj[_k];
          }
        }
        return obj;
      }

      collapse(_obj) {
        var _g, _k, i, j, k, key, len, len1, len2, obj, ref, ref1, ref2;
        obj = {};
        if (this.settings.group) {
          ref = this.settings.groups;
          for (i = 0, len = ref.length; i < len; i++) {
            _g = ref[i];
            ref1 = keys(_obj[_g]);
            for (j = 0, len1 = ref1.length; j < len1; j++) {
              _k = ref1[j];
              key = `${this.fieldCasingDB(_g)}${this.settings.separator}${this.fieldCasingDB(_k)}`;
              obj[key] = _obj[_g][_k];
            }
          }
        } else {
          ref2 = keys(_obj);
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            _k = ref2[k];
            obj[this.fieldCasingDB(_k)] = _obj[_k];
          }
        }
        return obj;
      }

    };

    casing = {
      camel: function(_str) {
        return camelCase(_str);
      },
      kebab: function(_str) {
        return kebabCase(_str);
      },
      pascal: function(_str) {
        return capitalize(camelCase(_str));
      },
      snake: function(_str) {
        return snakeCase(_str);
      }
    };

    return Serializer;

  }).call(this);

  module.exports = Serializer;

}).call(this);
