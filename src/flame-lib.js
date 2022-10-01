(function() {
  var FL, FirebaseApp, Flame, FlameError, FlameLib, VERSION, isEmpty;

  FirebaseApp = require('./firebase-app');

  Flame = require('./flame');

  FlameError = require('./flame-error');

  isEmpty = require('lodash/isEmpty');

  VERSION = '0.0.6';

  FlameLib = (function() {
    var apps, flames, options;

    class FlameLib {
      register(_opts) {
        var name, opt;
        for (name in _opts) {
          opt = _opts[name];
          if (!isEmpty(options[name])) {
            throw new FlameError(`'${name}' is already registered in Flame.`);
            return;
          }
          options[name] = opt;
        }
      }

      async init(_name) {
        var app, db, fba;
        app = apps[_name];
        if (!app) {
          ({fba, db} = (await FirebaseApp.prototype.create(_name, options[_name])));
          apps[_name] = {fba, db};
        }
      }

      async ignite(_name) {
        if (!options[_name]) {
          throw new FlameError(`'${_name}' is not registered in Flame.`);
          return;
        }
        await this.init(_name);
        flames[_name] = new Flame(apps[_name], options[_name]);
        return flames[_name];
      }

      async quench(_name) {
        if (apps[_name]) {
          await apps[_name].db.terminate();
          await apps[_name].fba.delete();
          delete apps[_name];
        }
        if (flames[_name]) {
          delete flames[_name];
        }
        if (options[_name]) {
          delete options[_name];
        }
      }

      purge() {
        apps = {};
        flames = {};
        options = {};
      }

    };

    apps = {};

    flames = {};

    options = {};

    return FlameLib;

  }).call(this);

  FL = new FlameLib();

  module.exports = FL;

}).call(this);
