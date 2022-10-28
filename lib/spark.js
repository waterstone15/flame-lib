(function() {
  var Spark, intersection, pick;

  intersection = require('lodash/intersection');

  pick = require('lodash/pick');

  Spark = class Spark {
    constructor(_data, shape) {
      this.shape = shape;
      this.data = this.shape.serializer.normalize(pick(_data, this.shape.serializer.paths(this.shape.data)));
      this.spark = this.shape.obj(this.data);
      return;
    }

    errors(_fields) {
      return this.shape.errors(this.spark, _fields);
    }

    save() {
      return this.shape.save(this.spark);
    }

    obj(_fields) {
      return this.shape.obj(this.spark, _fields);
    }

    valid() {
      return this.ok(...arguments);
    }

    ok(_fields) {
      return this.shape.ok(this.spark, _fields);
    }

    del() {
      return this.shape.del(this.spark);
    }

    update(_fields = []) {
      var all_fields;
      if (_fields === []) {
        return null;
      }
      all_fields = this.shape.serializer.paths(this.shape.data);
      return this.shape.update(this.spark, intersection(all_fields, _fields));
    }

  };

  module.exports = Spark;

}).call(this);
