(function() {
  var Adapter, camelCase, cloneDeep, filter, first, get, includes, isArray, isEmpty, isInteger, last, map, pick, reverse;

  camelCase = require('lodash/camelCase');

  cloneDeep = require('lodash/cloneDeep');

  filter = require('lodash/filter');

  first = require('lodash/first');

  get = require('lodash/get');

  includes = require('lodash/includes');

  isArray = require('lodash/isArray');

  isEmpty = require('lodash/isEmpty');

  isInteger = require('lodash/isInteger');

  last = require('lodash/last');

  map = require('lodash/map');

  pick = require('lodash/pick');

  reverse = require('lodash/reverse');

  Adapter = (function() {
    var ok_comparators;

    class Adapter {
      constructor(_app) {
        this.db = _app.db;
        this.fba = _app.fba;
      }

      save(_collection, _id, _data) {
        var writeable;
        writeable = {
          data: _data,
          doc_ref: this.db.collection(_collection).doc(_id),
          type: 'create',
          write: async function() {
            var err;
            try {
              await this.doc_ref.create(_data);
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          }
        };
        return writeable;
      }

      getAll(_collection, _ids, _shape, _fields) {
        var readable;
        return readable = {
          collection: _collection,
          doc_refs: map(_ids, (_id) => {
            return this.db.collection(_collection).doc(_id);
          }),
          db: this.db,
          type: 'getAll',
          read: async function() {
            var dss, err, expanded;
            try {
              dss = (await this.db.getAll(...this.doc_refs));
              if (!isEmpty(dss)) {
                expanded = map(dss, function(_ds) {
                  var ex;
                  ex = _shape.serializer.expand(_ds.data());
                  if (!isEmpty(_fields)) {
                    (ex = pick(ex, _fields));
                  }
                  return ex;
                });
                return expanded;
              }
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return null;
          }
        };
      }

      get(_collection, _id, _shape, _fields) {
        var readable;
        return readable = {
          collection: _collection,
          doc_ref: this.db.collection(_collection).doc(_id),
          id: _id,
          type: 'get',
          read: async function() {
            var ds, err, expanded;
            try {
              ds = (await this.doc_ref.get());
              if (ds.exists) {
                expanded = _shape.serializer.expand(ds.data());
                if (!isEmpty(_fields)) {
                  (expanded = pick(expanded, _fields));
                }
                return expanded;
              }
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return null;
          }
        };
      }

      update(_collection, _id, _data) {
        var writeable;
        writeable = {
          data: _data,
          doc_ref: this.db.collection(_collection).doc(_id),
          type: 'update',
          write: async function() {
            var err;
            try {
              await this.doc_ref.update(_data);
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          }
        };
        return writeable;
      }

      del(_collection, _id) {
        var writeable;
        writeable = {
          doc_ref: this.db.collection(_collection).doc(_id),
          type: 'delete',
          write: async function() {
            var err;
            try {
              await this.doc_ref.delete();
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          }
        };
        return writeable;
      }

      findOne() {
        return this.find(...arguments);
      }

      find(_collection, _constraints = [], _shape, _fields = []) {
        var c, i, len, query, readable, rest, type;
        query = this.db.collection(_collection);
        for (i = 0, len = _constraints.length; i < len; i++) {
          c = _constraints[i];
          [type, ...rest] = c;
          if (includes(['order-by', 'where'], type)) {
            rest[0] = _shape.serializer.pathCasingDB(rest[0]);
            query = query[camelCase(type)](...rest);
          }
        }
        query = query.limit(1);
        readable = {
          query: query,
          type: 'find',
          read: async function() {
            var err, expanded, qs;
            try {
              qs = (await this.query.get());
              if (!isEmpty(qs.docs)) {
                expanded = _shape.serializer.expand(qs.docs[0].data());
                if (!isEmpty(_fields)) {
                  (expanded = pick(expanded, _fields));
                }
                return expanded;
              }
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return null;
          }
        };
        return readable;
      }

      findAll() {
        return this.list(...arguments);
      }

      list(_collection, _constraints = [], _shape) {
        var c, i, len, query, readable, rest, type;
        query = this.db.collection(_collection);
        for (i = 0, len = _constraints.length; i < len; i++) {
          c = _constraints[i];
          [type, ...rest] = c;
          if (includes(['select'], type)) {
            rest = map(rest, function(_p) {
              return _shape.serializer.pathCasingDB(_p);
            });
            query = query[camelCase(type)](...rest);
          }
          if (includes(['order-by', 'where'], type)) {
            rest[0] = _shape.serializer.pathCasingDB(rest[0]);
            query = query[camelCase(type)](...rest);
          }
          if (includes(['end-at', 'end-before', 'limit', 'start-after', 'start-at'], type)) {
            query = query[camelCase(type)](...rest);
          }
        }
        readable = {
          query: query,
          type: 'list',
          read: async function() {
            var err, qs;
            try {
              qs = (await this.query.get());
              if (!isEmpty(qs.docs)) {
                return map(qs.docs, function(ds) {
                  var expanded;
                  expanded = _shape.serializer.expand(ds.data());
                  return expanded;
                });
              }
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return null;
          }
        };
        return readable;
      }

      // end at 'm' = start at 'm', flip 'asc' / 'desc', and reverse list
      // end before 'm' = start after 'm', flip 'asc' / 'desc', and reverse list
      page(_opts, _collection, _shape) {
        var readable;
        readable = {
          type: 'page',
          read: async() => {
            var coll_first, coll_first_csts, coll_last, coll_last_csts, csts, direction, items, start, value;
            csts = isArray(_opts.constraints) ? _opts.constraints : [];
            coll_first_csts = cloneDeep(csts);
            coll_last_csts = cloneDeep(csts);
            if (!isEmpty(get(_opts, 'order_by.field'))) {
              direction = includes(['asc', 'desc'], get(_opts, 'order_by.direction')) ? _opts.order_by.direction : 'asc';
              csts.push(['order-by', _opts.order_by.field, direction]);
              coll_first_csts.push(['order-by', _opts.order_by.field, direction]);
              coll_last_csts.push(['order-by', _opts.order_by.field, (direction === 'asc' ? 'desc' : 'asc')]);
            }
            if (!isEmpty(_opts.cursor)) {
              value = _opts.cursor.value;
              if (_opts.cursor.type === 'id') {
                (value = (await this.db.collection(_collection).doc(_opts.cursor.value).get()));
              }
              start = (_opts.cursor.inclusive === true) ? 'start-at' : 'start-after';
              csts.push([start, value]);
            }
            if (!isEmpty(_opts.fields) && isArray(_opts.fields)) {
              csts.push(['select', ..._opts.fields]);
              coll_first_csts.push(['select', ..._opts.fields]);
              coll_last_csts.push(['select', ..._opts.fields]);
            }
            if (isInteger(_opts.size) && _opts.size > 0) {
              csts.push(['limit', _opts.size]);
            }
            coll_first_csts = filter(coll_first_csts, function(_c) {
              return !includes(['end-before', 'end-at', 'start-after', 'start-at', 'limit'], _c[0]);
            });
            coll_last_csts = filter(coll_last_csts, function(_c) {
              return !includes(['end-before', 'end-at', 'start-after', 'start-at', 'limit'], _c[0]);
            });
            items = (await this.list(_collection, csts, _shape).read());
            coll_first = (await this.find(_collection, coll_first_csts, _shape, _opts.fields).read());
            coll_last = (await this.find(_collection, coll_last_csts, _shape, _opts.fields).read());
            if (get(_opts, 'order_by.direction') === 'desc') {
              items = reverse(items);
              [coll_first, coll_last] = [coll_last, coll_first];
            }
            return {
              collection: {
                first: coll_first,
                last: coll_last
              },
              page: {
                first: first(items),
                items: items,
                last: last(items)
              }
            };
          }
        };
        return readable;
      }

    };

    ok_comparators = ['<', '<=', '==', '>', '>=', '!=', 'array-contains', 'array-contains-any', 'in', 'not-in'];

    return Adapter;

  }).call(this);

  // batch: (writeables) ->

  // transaction: (fn) ->
  module.exports = Adapter;

}).call(this);
