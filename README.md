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

Flame is built to simplify working with server-side Firestore. Flame abstracts away redundant boilerplate code used for typical Firestore operations into a compact API. Flame also makes it easy to define and validate your data models.

# Benefits
* Simple API
* Clear, consistent data models
* Customizable
* Reduce Firestore-related lines of code by >50%
* Built in paging

# API
* [Register](#register)
* [Ignite](#ignite)
* [Release](#release)
* [Model](#model)
* [Create](#create)
* [Ok](#ok)
* [Errors](#errors)
* [Save](#save)
* [Update](#update)
* [Delete](#delete)
* [Get](#get)
* [Get All](#get-all)
* [Find](#find)
* [Find All](#find-all)
* [Page](#page)


## API

### Register

Define and name your Flame apps and their Firestore credentials.

*Register should only be called once per Flame app. Trying to register 'my-app' twice in the same process will throw an error.*

```javascript
var FL = require('flame-lib')

FL.register({
  'main': { service_account: JSON.parse(process.env.SERVICE_ACCOUNT) }
})
```

### Ignite

Returns a previously registered Flame app. Ignite also establishes the connection with Firestore.

*Ignite can be called repeatedly. The first call will establish a connection using the related service account specified in `FL.register()`. Any subsequent calls will reuse that connection.*

```javascript
var FL = require('flame-lib')

// This will only work if 'main' is already registered.
var Flame = await FL.ignite('main')
```

### Release

Releases resources for a previously ignited Flame.

*For most use cases, this is not necessary. However, if you regularly create and destroy connections to multiple Firestore projects, you may need to use `release()` to reduce memory pressure.*

```javascript
await Flame.release('main');
```

### Model

Defines a model. Flame supports computed fields by using a function. The function receives all non-computed fields provided when `create()` is called. Computed fields are persisted in Firestore when saved

Validators can be defined for each field as well (the field names must match). Validators are used by the `ok()` and `error()` methods. A validator function takes in a single argument, the value of the data field to validate. You cannot write validators for computed fields.

*Note: If you do not provide a validator for a field the default validator is used. The default validator always evaluates to `true`.*

```javascript
var Person = Flame.model('Person', {
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

### Create
Creates a new instance of a Model.

```javascript
john = Person.create({
    first_name: 'John',
    last_name: 'Doe',
  },
});
```

### Ok
You can check if the data of an instance is valid. `ok()` will check all validators by default. If a list of fields is supplied, `ok()` will check just the listed fields.

```javascript
john.ok();
// => true

john.ok([ 'first_name' ]);
// => true
```

### Errors
Errors is similar to Ok, but `errors()` returns an object of fields that have an error. `errors()` can be called with a list of fields to check just the listed fields.

```javascript
john.errors();
// => { first_name: true, last_name: true }

john.errors([ 'first_name' ]);
// => { first_name: true }
```

### Save

Save returns a "writeable" which has a `write()` function that is used to commit to Firestore.

*This two-step "intent → commit" API enables Flame to use the same simple API for basic writes, batch write transactions, and read-write transactions.*

```javascript
await john.save().write();
```

### Update

To make an update, create a new instance with the `id` and the other fields you would like to update. Then call `update()` with the specific fields you would like to write to Firestore.

```javascript
var john = Person.create({
    id: 'person-bkjh239e8adskfjhadf',
    first_name: 'Jane',
})
await john.update([ 'first_name' ]).write();
```

### Delete

To remove a record from your Firestore database, create an instance with just the `id` of the relevant model.

```javascript
var john = Person.create({
    id: 'person-bkjh239e8adskfjhadf'
})
await john.del().write();
```

### Get

Get returns a "readable" which has a `read()` function that is used to retrieve data from Firestore.

* The first argument is a document ID.
* The second argument is a list of fields to include.

```javascript
var jane = await Person.get('id').read();
// => { first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }
```

### Get All
Get All fetches a list of documents from Firestore in parallel. Assume document order is not stable.

* The first argument is a list of document IDs.
* The second argument is a list of fields to include.

```javascript
var people = await Person.getAll([ 'id', 'id', '...' ]).read();
// => [{ first_name: 'Jane', first_name: 'Doe', full_name: 'Jane Doe' }, ...]
```

### Find

Find is used to query for a single document in Firestore. If more than one document is found, `find()` will return null.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.find([['where', 'first_name', '==', 'John']], ['full_name']).read();

// => { full_name: 'Jane Doe' }
```

### Find All

Query Firestore for a matching set of documents.

`findAll()` returns a "readable" which has a `read()` function that is used to retrieve data from Firestore.

* The first argument is an array of constraints.
* The second argument is a list of fields to include.

```javascript
var john = await Person.findAll([['where', 'first_name', '>', 'J']], ['full_name']).read();

// => [{ full_name: 'Jane Doe' }, { full_name: 'John Doe' }]
```

### Page

Similar to Find all, but the resulting object is structured as paged data.

`page()` returns a "readable" which has a `read()` function that is used to retrieve data from Firestore.

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

