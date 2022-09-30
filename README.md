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

Flame is built do simplify working with Firestore. Flame abastracts away redundant boilerplate code used for typical database operations into a compact API. Flame also makes it easy to define and validate your data models.

1. [Register](#register)
1. [Ignite](#ignite)
1. [Quench](#quench)
1. [Shape (aka Model)](#shape-aka-model)
1. [Spark (aka Create)](#spark-aka-create)
1. [Validation](#validattion)
1. [Save](#save)
1. [Update](#update)
1. [Delete](#delete-aka-remove)
1. [Get](#get)
1. [Get All](#get-all)
1. [Find](#find)
1. [List](#list)
1. [Page](#page)

## API

### Register

Define the firebase apps and their connections for use with Flame models.

```javascript
var FL = require('flame-lib')

FL.register({
  'main': { service_account: JSON.parse(process.env.SERVICE_ACCOUNT) }
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


```javascript
john.ok();

// => true
```

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

```javascript
await john.update({ first_name: 'Jane' }).write();
```

### Delete (aka Remove)

```javascript
await john.del().write();
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

* The first argument is a list of document IDs.
* The second argument is a list of fields to include.

```javascript
var people = await Person.getAll([ 'id', 'id', '...' ]).read();

// => [{ first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }, ...]
```

### Find

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

