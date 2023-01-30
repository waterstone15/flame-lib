(function() {
  var DateTime, FlameError, Serializer, Shape, Spark, cloneDeep, every, forEach, get, includes, intersection, isArray, isBoolean, isEmpty, isEqual, isFunction, isString, map, merge, omit, pick, random, set, unset;

  Serializer = require('./serializer');

  Spark = require('./spark');

  FlameError = require('./flame-error');

  cloneDeep = require('lodash/cloneDeep');

  every = require('lodash/every');

  forEach = require('lodash/forEach');

  get = require('lodash/get');

  includes = require('lodash/includes');

  intersection = require('lodash/intersection');

  isArray = require('lodash/isArray');

  isBoolean = require('lodash/isBoolean');

  isEmpty = require('lodash/isEmpty');

  isEqual = require('lodash/isEqual');

  isFunction = require('lodash/isFunction');

  isString = require('lodash/isString');

  map = require('lodash/map');

  merge = require('lodash/merge');

  omit = require('lodash/omit');

  pick = require('lodash/pick');

  random = require('@stablelib/random');

  set = require('lodash/set');

  unset = require('lodash/unset');

  ({DateTime} = require('luxon'));

  Shape = class Shape {
    constructor(_adapter, _type, _obj, _config) {
      var defaultValidator, default_validators, ref, ref1, validatorsOk;
      this.adapter = _adapter;
      this.config = _config;
      this.serializer = new Serializer(_config);
      defaultValidator = function(_d) {
        return true;
      };
      default_validators = {};
      forEach(this.serializer.paths(_obj.data), function(_p) {
        if (!isFunction(get(_obj, `validators.${_p}`))) {
          set(_obj, `validators.${_p}`, defaultValidator);
        }
      });
      validatorsOk = every(this.serializer.paths(_obj.validators), function(_p) {
        var v;
        v = get(_obj.validators, _p);
        return isFunction(v) && v.length === 1;
      });
      if (!validatorsOk) {
        throw new FlameError('Every validator must be a function that takes one argument.');
        return;
      }
      this.collection = (ref = get(_obj, 'data.meta.collection')) != null ? ref : (ref1 = get(_obj, 'data.collection')) != null ? ref1 : this.serializer.collectionCasing(_type);
      this.data = this.serializer.normalize(merge(this.defaultData(), _obj.data));
      this.type = this.serializer.typeCasingDB(_type);
      this.validators = this.serializer.normalize(merge(this.defaultValidators(), _obj.validators));
      return;
    }

    defaultData() {
      var df, fs;
      df = {
        collection: (_o) => {
          return this.collection;
        },
        created_at: (_o) => {
          return DateTime.local().setZone('utc').toISO();
        },
        deleted: (_o) => {
          return false;
        },
        deleted_at: (_o) => {
          return null;
        },
        id: (_o) => {
          return `${this.type}-${random.randomString(32)}`;
        },
        idempotency_key: (_o) => {
          return null;
        },
        type: (_o) => {
          return this.type;
        },
        updated_at: (_o) => {
          return DateTime.local().setZone('utc').toISO();
        },
        v: (_o) => {
          return '1.0.0';
        }
      };
      if (this.config.group) {
        df = {
          meta: df
        };
      }
      fs = map(this.config.fields, (_f) => {
        if (this.config.group) {
          return `meta.${_f}`;
        } else {
          return _f;
        }
      });
      return pick(df, fs);
    }

    defaultValidators() {
      var df;
      df = {
        collection: function(_v) {
          return !isEmpty(_v) && isString(_v);
        },
        created_at: function(_v) {
          return (_v === null) || (!isEmpty(_v) && isString(_v));
        },
        deleted: function(_v) {
          return isBoolean(_v);
        },
        deleted_at: function(_v) {
          return (_v === null) || (!isEmpty(_v) && isString(_v));
        },
        id: function(_v) {
          return !isEmpty(_v) && isString(_v);
        },
        idempotency_key: function(_v) {
          return isEmpty(_v) || (!isEmpty(_v) && isString(_v));
        },
        type: function(_v) {
          return !isEmpty(_v) && isString(_v);
        },
        updated_at: function(_v) {
          return (_v === null) || (!isEmpty(_v) && isString(_v));
        },
        v: function(_v) {
          return !isEmpty(_v) && isString(_v);
        }
      };
      if (this.config.group) {
        df = {
          meta: df
        };
      }
      return pick(df, this.defaultPaths());
    }

    defaultPaths() {
      return map(this.config.fields, (_f) => {
        if (this.config.group) {
          return `meta.${_f}`;
        } else {
          return _f;
        }
      });
    }

    extend(_type, _obj, _opts = {}) {
      var config, obj;
      obj = merge({
        data: omit(cloneDeep(this.data), this.defaultPaths())
      }, {
        validators: omit(cloneDeep(this.validators), this.defaultPaths())
      }, _obj);
      config = this.config.extend(_opts);
      return new Shape(this.adapter, _type, obj, config);
    }

    errors(_data, _fields) {
      var _f, errors, fields, fn, i, kk, len, obj;
      fields = this.serializer.paths(this.data);
      if (isArray(_fields)) {
        (fields = intersection(fields, _fields));
      }
      obj = this.obj(_data, _fields);
      errors = {};
      for (i = 0, len = fields.length; i < len; i++) {
        _f = fields[i];
        fn = get(this.validators, _f);
        kk = fn(get(obj, _f));
        if (!kk) {
          set(errors, _f, !kk);
        }
      }
      return errors;
    }

    obj(_data, _fields) {
      var _f, d, fields, fn, i, len;
      fields = this.serializer.paths(this.data);
      if (isArray(_fields)) {
        (fields = intersection(fields, _fields));
      }
      d = merge(cloneDeep(this.data), _data);
      for (i = 0, len = fields.length; i < len; i++) {
        _f = fields[i];
        fn = get(d, _f);
        if (isFunction(fn)) {
          set(d, _f, fn(d));
        }
      }
      return pick(d, fields);
    }

    ok(_data, _fields) {
      return isEmpty(this.errors(_data, _fields));
    }

    save(_data) {
      var collapsed, collection, id, obj, writable;
      if (!this.ok(_data)) {
        return null;
      }
      obj = this.obj(_data);
      collection = this.config.group ? obj.meta.collection : obj.collection;
      id = this.config.group ? obj.meta.id : obj.id;
      collapsed = this.serializer.collapse(obj);
      writable = this.adapter.save(collection, id, collapsed);
      return writable;
    }

    getAll(_ids, _fields) {
      var readable;
      readable = this.adapter.getAll(this.collection, _ids, this, _fields);
      return readable;
    }

    getOne() {
      return this.get(...arguments);
    }

    get(_id, _fields) {
      var readable;
      readable = this.adapter.get(this.collection, _id, this, _fields);
      return readable;
    }

    update(_data, _fields) {
      var ca_path, collapsed, collection, id, now, obj, prefix, ua_path, updates, writable;
      if (!this.ok(_data, _fields) || _fields === null) {
        return null;
      }
      obj = this.obj(_data);
      updates = this.obj(_data, _fields);
      prefix = this.config.group ? 'meta.' : '';
      ca_path = prefix + this.serializer.fieldCasing('created_at');
      if (includes(this.config.fields, 'created_at') && !includes(_fields, ca_path)) {
        unset(updates, ca_path);
      }
      ua_path = prefix + this.serializer.fieldCasing('updated_at');
      if (includes(this.config.fields, 'updated_at') && !includes(_fields, ua_path)) {
        now = DateTime.local().setZone('utc').toISO();
        set(updates, ua_path, now);
      }
      collection = this.config.group ? obj.meta.collection : obj.collection;
      id = this.config.group ? obj.meta.id : obj.id;
      collapsed = this.serializer.collapse(updates);
      writable = this.adapter.update(collection, id, collapsed);
      return writable;
    }

    remove() {
      return this.del(...arguments);
    }

    del(_data) {
      var collection, id, obj, writable;
      obj = this.obj(_data);
      collection = this.config.group ? obj.meta.collection : obj.collection;
      id = this.config.group ? obj.meta.id : obj.id;
      writable = this.adapter.del(collection, id);
      return writable;
    }

    create() {
      return this.spark(...arguments);
    }

    spark(_data) {
      return new Spark(_data, this);
    }

    findOne() {
      return this.find(...arguments);
    }

    find(_constraints, _fields) {
      var readable;
      readable = this.adapter.find(this.collection, _constraints, this, _fields);
      return readable;
    }

    findAll() {
      return this.list(...arguments);
    }

    list(_constraints) {
      var readable;
      readable = this.adapter.list(this.collection, _constraints, this);
      return readable;
    }

    page(_opts) {
      var readable;
      readable = this.adapter.page(_opts, this.collection, this);
      return readable;
    }

  };

  // addQuery: ->

  // q: ->
  module.exports = Shape;

}).call(this);
