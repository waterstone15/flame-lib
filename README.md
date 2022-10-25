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

Flame is built to simplify working with Firestore. Flame abastracts away redundant boilerplate code used for typical Firestore operations into a compact API. Flame also makes it easy to define and validate your data models.

# Benefits
* Simple API
* Clear, consistent data models
* Best-practice defaults
* Customizeable
* Reduces Firestore-related LoC by 2~5x
* Built in paging tools

# API
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

Define and name your 'Flame apps' and their related firestore credentials.

*Register should only be called once per Flame app in a process. Trying to register 'my-app' twice in the same process will throw an error.*

```javascript
var FL = require('flame-lib')

FL.register({
  'main': { service_account: JSON.parse(process.env.SERVICE_ACCOUNT) }
})
```

### Ignite

Returns a previously registered Flame. Estabilishes the conection to Firestore if not alrady connected.

*Ignite can be called repeatedly. The frist call will estabilish a connection using the related service account specified in `FL.register(...)`. Any subsequent calls will reuse that connectio*n.

```javascript
var FL = require('flame-lib')

// This will only work if 'main' is already registered.
var Flame = await FL.ignite('main')
```

### Quench

Releases resources for a previously ignited Flame.

*For most use cases, this is not necessary. However, if you regularly create and destroy connections to multiple Firestore projects, you may need to use `quench` to reduce memory pressure.*

```javascript
await Flame.quench('main');
```

### Shape (aka Model)

Shape defines a model. Flame supports computed fields by using a function. The function recieves all non-computed fields provided when `spark` is called. Computed fields are persisted in Firestore when saved

Validators can be defined for eeach field as well (the field names must match). Validators are used by the `ok` and `error` methods. A validator function takes in a single argument, the value of the data field to validate. You cannot write validators for computed fields.

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
Simply create a new instance of a Model. Sparks are immutable.

```javascript
john = Person.spark({
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

### Validation
You can check if the data supplied to a spark is valid. `ok` will check all validators by default. if a list of fields is supplied, `ok` will check just the listed fields.

```javascript
john.ok();
// => true

john.ok([ 'first_name' ]);
// => true
```

The error function works simlarily. It returns an object of the fields and their error status.

```javascript
john.errors();
// => { first_name: true, last_name: true }

john.errors([ 'first_name' ]);
// => { first_name: true }
```

### Save

Save returns a "writeable" which has a `write()` function that is used to commit to Firestore.

*This two-step "intent → commit" architecture enables Flame to use the same simple API for basic writes, batch write tranactions, and read-write transactions.*

```javascript
await john.save().write();
```

### Update

To make an update, create a partial-spark with just the `id` of the relevant model. Then use the `update` function to update specific fields.

```javascript
var john = Person.spark({
    id: 'person-bkjh239e8adskfjhadf'
})
await john.update({ first_name: 'Jane' }).write();
```

### Delete (aka Remove)

To remove a record from your Firestor database, create a partial spark with just the `id` of the relevant model.

```javascript
var john = Person.spark({
    id: 'person-bkjh239e8adskfjhadf'
})
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
Get All fetches a list of documents from firestore in parallel. Assume document order is not stable.

* The first argument is a list of document IDs.
* The second argument is a list of fields to include.

```javascript
var people = await Person.getAll([ 'id', 'id', '...' ]).read();
// => [{ first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }, ...]
```

### Find

Find is used to query for a single document in Firestore. If more than one document is found, `find` will return null.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.list([['where', 'first_name', '==', 'John']], ['full_name']).read();

// => { full_name: 'Jane Doe' }
```

### List

List is used to query Firestore for a matching set of documents.

List returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.list([['where', 'first_name', '>', 'J']], ['full_name']).read();

// => [{ full_name: 'Jane Doe' }, { full_name: 'John Doe' }]
```

### Page

Page works simlarily to list, but returns the information in a structure that is convenient for paged data interaction.

Page returns a "readable" which has a `read()` function that is used to retrive data from Firestore.

```javascript
var page = await Person.page({
  constraints: [['where', 'first_name', '>', 'J']],
  cursor: {
    type: 'id',
    inclusive: true,
  }
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

