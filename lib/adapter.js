(function() {
  var Adapter, all, camelCase, cloneDeep, filter, first, get, includes, isArray, isEmpty, isInteger, last, map, nth, pick, reverse, sortBy, take;

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

  nth = require('lodash/nth');

  pick = require('lodash/pick');

  reverse = require('lodash/reverse');

  sortBy = require('lodash/sortBy');

  take = require('lodash/take');

  ({all} = require('rsvp'));

  Adapter = (function() {
    var ok_comparators;

    class Adapter {
      constructor(_app) {
        this.db = _app.db;
        this.fba = _app.fba;
      }

      async transact(_f) {
        var err, result;
        try {
          result = (await this.db.runTransaction(async function(_t) {
            return (await _f(_t));
          }));
          return result;
        } catch (error) {
          err = error;
          console.log(err);
          return null;
        }
      }

      save(_collection, _id, _data) {
        var writeable;
        writeable = {
          data: _data,
          doc_ref: this.db.collection(_collection).doc(_id),
          type: 'create',
          write: async function(_t) {
            var err;
            if (_t) {
              return (await this.writeT(_t));
            }
            try {
              await this.doc_ref.create(_data);
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          },
          writeT: async function(_t) {
            await _t.create(this.doc_ref, _data);
            return true;
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
            if (this.doc_refs.length <= 0) {
              return null;
            }
            try {
              dss = (await this.db.getAll(...this.doc_refs));
              if (!isEmpty(dss)) {
                expanded = map(dss, function(_ds) {
                  var ex;
                  ex = _shape.serializer.expand(_ds.data());
                  if (!(isEmpty(_fields))) {
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
          read: async function(_t) {
            var ds, err, expanded;
            if (_t) {
              return (await this.readT(_t));
            }
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
          },
          readT: async function(_t) {
            var ds, expanded;
            ds = (await _t.get(this.doc_ref));
            if (ds.exists) {
              expanded = _shape.serializer.expand(ds.data());
              if (!isEmpty(_fields)) {
                (expanded = pick(expanded, _fields));
              }
              return expanded;
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
          write: async function(_t) {
            var err;
            if (_t) {
              return (await this.writeT(_t));
            }
            try {
              await this.doc_ref.update(_data);
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          },
          writeT: async function(_t) {
            await _t.update(this.doc_ref, _data);
            return true;
          }
        };
        return writeable;
      }

      del(_collection, _id) {
        var writeable;
        writeable = {
          doc_ref: this.db.collection(_collection).doc(_id),
          type: 'delete',
          write: async function(_t) {
            var err;
            if (_t) {
              return (await this.writeT(_t));
            }
            try {
              await this.doc_ref.delete();
              return true;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return false;
          },
          writeT: async function(_t) {
            await t.delete(this.doc_ref);
            return true;
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
          if (includes(['end-at', 'end-before', 'start-after', 'start-at'], type)) {
            query = query[camelCase(type)](...rest);
          }
        }
        query = query.limit(1);
        readable = {
          query: query,
          type: 'find',
          read: async function(_t) {
            var err, expanded, qs;
            if (_t) {
              return (await this.readT(_t));
            }
            try {
              qs = (await this.query.get());
              if (!qs.empty) {
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
          },
          readT: async function(_t) {
            var expanded, qs;
            qs = (await _t.get(this.query));
            if (!qs.empty) {
              expanded = _shape.serializer.expand(qs.docs[0].data());
              if (!isEmpty(_fields)) {
                (expanded = pick(expanded, _fields));
              }
              return expanded;
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
          read: async function(_t) {
            var err, qs;
            if (_t) {
              return (await this.readT(_t));
            }
            try {
              qs = (await this.query.get());
              if (!qs.empty) {
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
          },
          readT: async function(_t) {
            var qs;
            qs = (await _t.get(this.query));
            if (!qs.empty) {
              return map(qs.docs, function(ds) {
                var expanded;
                expanded = _shape.serializer.expand(ds.data());
                return expanded;
              });
            }
            return null;
          }
        };
        return readable;
      }

      count(_collection, _constraints = [], _shape) {
        var c, i, len, query, readable, rest, type;
        query = this.db.collection(_collection);
        for (i = 0, len = _constraints.length; i < len; i++) {
          c = _constraints[i];
          [type, ...rest] = c;
          if (includes(['order-by', 'where'], type)) {
            rest[0] = _shape.serializer.pathCasingDB(rest[0]);
            query = query[camelCase(type)](...rest);
          }
          if (includes(['end-at', 'end-before', 'start-after', 'start-at'], type)) {
            query = query[camelCase(type)](...rest);
          }
        }
        query = query.count();
        readable = {
          query: query,
          type: 'count',
          read: async function(_t) {
            var err, qs;
            if (_t) {
              return (await this.readT(_t));
            }
            try {
              qs = (await this.query.get());
              if ((typeof qs.data === "function" ? qs.data().count : void 0) != null) {
                return qs.data().count;
              }
              return null;
            } catch (error) {
              err = error;
              console.log(err);
              (function() {})();
            }
            return null;
          },
          readT: async function(_t) {
            var qs;
            qs = (await _t.get(this.query));
            if ((typeof qs.data === "function" ? qs.data().count : void 0) != null) {
              return qs.data().count;
            }
            return null;
          }
        };
        return readable;
      }

      page(_opts, _collection, _shape) {
        var readable;
        readable = {
          type: 'page',
          read: async() => {
            var Q, at_end, cdoc, col_first, col_fstQ, col_last, col_lstQ, count_rest, count_restQ, count_total, count_totalQ, counts, cursor, field, fields, ignore, is_rev, items, itemsQ, next, nextQ, prev, prevQ, ref, ref1, ref2, ref3, ref4, size;
            ignore = ['end-before', 'end-at', 'limit', 'order-by', 'start-after', 'start-at'];
            Q = isArray(_opts.constraints) ? _opts.constraints : [];
            Q = filter(Q, function(_c) {
              return !includes(ignore, _c[0]);
            });
            col_fstQ = cloneDeep(Q);
            col_lstQ = cloneDeep(Q);
            itemsQ = cloneDeep(Q);
            prevQ = cloneDeep(Q);
            nextQ = cloneDeep(Q);
            count_totalQ = cloneDeep(Q);
            count_restQ = cloneDeep(Q);
            cursor = (!!((ref = _opts.cursor) != null ? ref.value : void 0)) ? _opts.cursor.value : null;
            field = (!!((ref1 = _opts.sort) != null ? ref1.field : void 0)) ? (ref2 = _opts.sort) != null ? ref2.field : void 0 : null;
            at_end = (((ref3 = _opts.cursor) != null ? ref3.position : void 0) === 'page-end') ? true : false;
            is_rev = (((ref4 = _opts.sort) != null ? ref4.order : void 0) === 'high-to-low') ? true : false;
            if (!field && !cursor) {
              (function() {})();
            }
            if (!field && cursor) {
              (function() {})();
            }
            
            // order-by
            if (field && !cursor) {
              col_fstQ = [...col_fstQ, ['order-by', field, (is_rev ? 'desc' : 'asc')]];
              col_lstQ = [...col_lstQ, ['order-by', field, (is_rev ? 'asc' : 'desc')]];
              itemsQ = [...itemsQ, ['order-by', field, (is_rev ? 'desc' : 'asc')]];
            }
            // start-at, order-by
            if (field && cursor) {
              cdoc = (await this.db.collection(_collection).doc(cursor).get());
              col_fstQ = [...col_fstQ, ['order-by', field, (is_rev ? 'desc' : 'asc')]];
              col_lstQ = [...col_lstQ, ['order-by', field, (is_rev ? 'asc' : 'desc')]];
              count_restQ = [...count_restQ, ['order-by', field, (((is_rev && !at_end) || (!is_rev && at_end)) ? 'desc' : 'asc')]];
              count_restQ = [...count_restQ, ['start-at', cdoc]];
              itemsQ = [...itemsQ, ['order-by', field, (((is_rev && !at_end) || (!is_rev && at_end)) ? 'desc' : 'asc')]];
              itemsQ = [...itemsQ, ['start-at', cdoc]];
              if (!is_rev && at_end) {
                (nextQ = [...nextQ, ['order-by', field, 'asc']]);
              }
              if (is_rev && at_end) {
                (nextQ = [...nextQ, ['order-by', field, 'desc']]);
              }
              if (at_end) {
                (nextQ = [...nextQ, ['start-after', cdoc]]);
              }
              if (!is_rev && !at_end) {
                (prevQ = [...prevQ, ['order-by', field, 'desc']]);
              }
              if (is_rev && !at_end) {
                (prevQ = [...prevQ, ['order-by', field, 'asc']]);
              }
              if (!at_end) {
                (prevQ = [...prevQ, ['start-after', cdoc]]);
              }
            }
            fields = isArray(_opts.fields) ? _opts.fields : [];
            size = (isInteger(_opts.size) && _opts.size > 0) ? _opts.size : 1;
            if (!isEmpty(fields)) {
              itemsQ = [...itemsQ, ['select', ...fields]];
            }
            col_fstQ = [...col_fstQ, ['select', []]];
            col_lstQ = [...col_lstQ, ['select', []]];
            count_restQ = [...count_restQ, ['select', []]];
            nextQ = [...nextQ, ['select', []]];
            prevQ = [...prevQ, ['select', []]];
            itemsQ = [...itemsQ, ['limit', size + 1]];
            [col_first, col_last, count_rest, count_total, items, next, prev] = (await all([this.find(_collection, col_fstQ, _shape, fields).read(), this.find(_collection, col_lstQ, _shape, fields).read(), this.count(_collection, count_restQ, _shape).read(), this.count(_collection, count_totalQ, _shape).read(), this.list(_collection, itemsQ, _shape).read(), this.find(_collection, nextQ, _shape, fields).read(), this.find(_collection, prevQ, _shape, fields).read()]));
            prev = (function() {
              switch (false) {
                case !(cursor && field && !at_end):
                  return prev;
                case !(at_end && items && (items.length > size)):
                  return nth(items, -1);
                default:
                  return null;
              }
            })();
            next = (function() {
              switch (false) {
                case !(cursor && field && at_end):
                  return next;
                case !(!at_end && items && (items.length > size)):
                  return nth(items, -1);
                default:
                  return null;
              }
            })();
            counts = {};
            counts.total = count_total;
            counts.page = (take(items, size)).length;
            counts.before = at_end ? count_rest - counts.page : counts.total - count_rest;
            counts.after = at_end ? counts.total - count_rest : count_rest - counts.page;
            counts.rest = count_rest;
            if (at_end) {
              (items = reverse(items));
            }
            items = take(items, size);
            return {
              counts: counts,
              collection: {
                first: col_first,
                last: col_last
              },
              page: {
                first: first(items),
                items: items,
                last: last(items)
              },
              next: next,
              prev: prev
            };
          }
        };
        return readable;
      }

    };

    ok_comparators = ['<', '<=', '==', '>', '>=', '!=', 'array-contains', 'array-contains-any', 'in', 'not-in'];

    return Adapter;

  }).call(this);

  module.exports = Adapter;

}).call(this);
