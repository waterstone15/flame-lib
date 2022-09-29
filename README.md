<br>
<p align="center">
  <img width="270" height="122" src="/img/flame.png">
</p>
<p align="center">
  A data model and query library for Firestore.
</p>
<br>
<br>
<hr style='height: 1px;'/>
<br>

Usage:
1. [Register](#register)
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
12. [Get All](#get-all)
13. [Find](#find)
14. [List](#list)
15. [Write Transaction](#write-transaction)

## API

### Register

Define the firebase apps and their connections for use with Flame models.

```javascript
var FL = require('flame-lib')

FL.register({
  'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) }
})
```

### Ignite

Returns a previously registered Flame. Estabilishes the conection to Firestore if not alrady connected.

```javascript
var FL = require('flame-lib')

var Flame = await FL.ignite('main')
```

### Quench

Releases resources for a previously ignited Flame.

```javascript
await Flame.quench('main');
```

### Shape (aka Model)
```javascript
var Person = Flame.shape('Person', {
  data: {
    first_name: null,
    last_name: null,
    full_name: (_data) => `${_data.first_name} ${_data.last_name}`,
  },
  validators: {
    first_name: (v) => !_.isEmpty(v) && _.isString(v),
    last_name: (v) => !_.isEmpty(v) && _.isString(v),
  },
});
```

### Spark (aka Create)
```javascript
john = Person.spark({
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

### Validation

Check if all validators pass.

```javascript
john.ok();
// => Boolean
```

Get an errors object.

```javascript
john.errors();
// => { first_name: false, last_name: true }
```

### Save

Save returns a "writeable" which has a `write()` function that is used to commit to Firestore.

```javascript
await john.save().write();
```

### Update

Update returns a "writeable" which has a `write()` function that is used to commit to Firestore.

```javascript
await john.update({ first_name: 'Jane' }).write();
```

### Delete (aka Remove)

Del returns a "writeable" which has a `write()` function that is used to commit to Firestore.

```javascript
await john.del().write;
```

### Get

Get returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

* The first argument is a document ID.
* The second argument is a list of fields to include.

```javascript
var jane = await Person.get('id').read();
// => { first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }
```

### Get All

Get All returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

* The first argument is a list of document IDs.
* The second argument is a list of fields to include.

```javascript
var people = await Person.getAll([ 'id', 'id', '...' ]).read();
// => [{ first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }, ...]
```

### Find

Find returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.list([['where', 'first_name', '==', 'John']], ['full_name']).read();
// => { full_name: 'Jane Doe' }
```

### List

List returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.list([['where', 'first_name', '>', 'J']], ['full_name']).read();
// => [{ full_name: 'Jane Doe' }, { full_name: 'John Doe' }]
```

### Page

Page returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

```javascript
var page = await Person.page({
  constraints: [['where', 'first_name', '>', 'J']],
  cursor: {
    type: 'id',
    inclusive: true,
  }
  direction: 2,
  fields: [ 'full_name' ],
  order_by: {
    direction: 'asc',
    field: 'first_name',
  }
  size: 2,
}).read();
// => {
//   collection: {
//     first: <Person>,
//     last: <Person>,
//   }
//   page: {
//     first: <Person>,
//     items: [<Person>, ...],
//     last: <Person>,
//   }
// }
```

