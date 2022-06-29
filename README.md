<br>
<p align="center">
  <img width="270" height="122" src="/img/flame.png">
</p>
<p align="center">
  A data model and query library for Firestore.
</>
<br>
<br>
<hr style='height: 1px;'/>
<br>

1. [Ignite](#ignite)
2. [Hold](#hold)
3. [Quench](#quench)
4. [Shape (i.e. define model)](#shape)
5. [Spark (i.e. instantiate model)](#spark)
6. [Ok (i.e. validate)](#ok)
7. [Save](#save)
8. [Update](#update)
9. [Upsert](#upsert)
10. [Delete](#delete)
11. [Get](#get)
12. [Find](#find)
13. [List](#list)
14. [Write Transaction](#write-transaction)

## API

### Ignite
```javascript
flame = require('flame-lib');

const cert = JSON.parse(Buffer.from(process.env.FIREBASE_CONFIG_BASE64, 'base64').toString());
const dbURL = process.env.FIREBASE_DATABASE_URL;


Flame = await flame.ignite('main', {}, dbURL, certificate);
// For use with firebase functions (auto load) with no credential, and no name.

// flame itself should be a singleton. if it is required over and over in the same process (web server), each flame = require 'flame-lib' should return the same object.

FlameOther = await flame.ignite(
  'other',
  {
    credential: '...' # .json | base64
  }
);
```

### Hold
```javascript
flame = require('flame-lib');

Flame = flame.hold();
// => retrieves previously ignited Flame instance using 'default' firestore app.

FlameOther = flame.hold('other');
// => retrieves previously ignited Flame instance using 'other' firestore app.
// no need for multi-app support at this point
```

### Quench
```javascript
flame = require('flame-lib');

await flame.quench();
// => releases resources for previously ignited Flame using 'default' firestore app.

await flame.quench('other');
// => releases resources for previously ignited Flame using 'other' firestore app.
```

### Shape
```javascript
Person = Flame.shape("Person", {
  val: {
    name: null,
  },
  ok: {
    val: {
      name: (v) => !isEmpty(v) && isString(v),
    },
  },
});
// Person is now an extended Flame object with more fields and matching validators.
// Child = Person.extend({}) should work as well (for arbritrary model extension)
// any field can have a default value, or a default function – if a function is supplied, when creating a new instance of the model, the function should be run to generate the value (eg, good for generating new IDs, or an Idempotency Key depends on things not known until the instance is created, but created the same way for all Models.
// there are also a default set of fields all Flame models will have (and eventually some should be excludeable via options parameter I suppose)
// a validator (a corresponding ok.<field path> is required for every field
```

### Spark
```javascript
john = Person.spark({
  val: {
    name: 'John Doe',
  },
});
// once john is created, the field values cannot be modified. create returns an instance with imutable fields. This forces some better coding habbits (on my part) and helps me reason about what *is* going into the database.
```

### Ok
```javascript
john.ok();
// runs the validator for each field.
// => true | false

john.ok(['val.name']);
// validates just the set of fields passed in (will come in handy for udpates)

john.errors();
// returns an object like { val: { name: 'John Doe' }} of the fields that are not valid.

john.errors(['val.name']);
// returns an object like { val: { name: 'John Doe' }} of the fields that are not valid but only for the passed in fields
```

### Save
```javascript
await john.save().write();
// john.save returns a 'writable' – Flames own internal representation of what can be turned into a firebase document reference and the javascript object for saving to firestore.
```

### Update
```javascript
await john.update(['val.name']).write();
// john.update returns a 'writable' – Flames own internal representation of what can be turned into a firebase document reference and the javascript object for updating firestore.
```

### Upsert
```javascript
await john.upsert(['val.name']).write();
// john.update returns a 'writable' – Flames own internal representation of what can be turned into a firebase document reference and the javascript object for saving or updating firestore.
// not sure about this one yet. There are some odd edgaces in the cases I use 'upsert' style operations...
```

### Delete
```javascript
await john.del().write();
// delete instead of delete because delete is a JavaScript keyword.
// john.del returns a 'writable' – Flames own internal representation of what can be turned into a firebase document reference and the javascript object for deleting from firestore.
```

### Get
```javascript
await Person.get('id').read();
// Model.get() returns a 'readable' – Flames own internal representation of what can be turned into a firestore document reference for reading from firestore
```

### Find
```javascript
await Person.find([
  ['where', 'name', '==', 'John']
  // ...
  // any number of constraints that can be used with firestore queries but for a single document only
]).read();
```

### List
```javascript
await Person.list([
  ['where', 'name', '>', 'J'],
  ['order_by', 'name']
  // any number of constraints that can be used with firestore queries
  // prob should chat about this one, it needs to handle cursor based paging and firestore has some really odd quirks here
], ['meta.id', 'val.name']).read();
// results can 'pick' specific fields
// list needs to return the collection 'page' of results, the first item in the collection, and the last item in the collection
```

### Write Transaction
```javascript
await Flame.write([
  a.save()
  b.update()
  c.del()
]);
// save, update, and del all return 'writables' which Flame.write then converts into a firestore write batch
```
