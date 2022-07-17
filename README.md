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

Usage:
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
    firstName: null,  // a raw field
    lastName: null,  // a raw field
    fullName: s => `${s.val.firstName} ${s.val.lastName}`,  // a derived field (based on raw fields)
  },
  ok: {
    val: {
      firstName: (v) => !isEmpty(v) && isString(v),
      lastName: (v) => !isEmpty(v) && isString(v),
      // derived fields don't have a corresponding validator
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
john.errors();
// returns an object like { val: { name: 'John Doe' }} of the fields that are not valid.

john.ok();
// returns true IFF there are no errors
```

### Insert (aka Save)
```javascript
await john.insert();
```

### Update
```javascript
await john.fragments().set("val", "name", "Jimmy").update();
```

### Upsert
```javascript
await john.upsert();
```

### Remove (aka Delete)
```javascript
await john.remove();
```

### Get
```javascript
await Person.get('id');
```

### Find
```javascript
john = await Person.find(['firstName', '==', 'John'], ['lastName', '==', 'Doe']);
// any number of constraints that can be used, but to identify a single document only
```

### List
```javascript
await Person.list(
  10,  // page size
  2, // page number (zero based)
  ['name'],  // order by (null for no order)
  ['meta:id', 'val:name'], // fields to retrieve (null for full Sparks)
  ['val', 'name', '>', 'J'], // filters
  ['meta', 'createdAt', '>', '2021-03-03T01:01:01Z'], // filters ...
);
```

### Write Transaction
```javascript
await Flame.batch()
  .insert(sparkA)
  .update(sparkB.fragments().set("val", "firstName", "Martin"))
  .remove(sparkC)
  .commit();
]);
```


## Development

### To run the tests:
0. install Firebase emulators ```firebase init```
1. start Firebase emulators: ```firebase emulators:start```
2. run the tests: ```npm run test```
