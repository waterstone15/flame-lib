# Flame Library
A data model and query library for Firestore.

1. [Set Up](#set-up)
2. [Ignite](#ignite)
3. [Models](#models)
5. [Create](#create)
6. [Validate](#validate)
7. [Save](#save)
8. [Update](#update)
9. [Upsert](#upsert)
10. [Delete](#delete)
11. [Get](#get)
12. [Find](#find)
13. [List](#list)
14. [Write Transaction](#write-transaction)

## API

### Set Up
```coffeescript
flame = require 'flame-lib'

flame.setup()

flame.setup({
  credential: '...' # .json | base64
  name: 'other'
})
```

### Ignite
```coffeescript
flame = require 'flame-lib'

Flame = await flame.ignite()
# => Flame instance using 'default' firestore app

FlameOther = await flame.ignite('other')
# => Flame instance using 'other' firestore app
```

### Models
```coffeescript
Person = Flame.extend({
  obj:
    val:
      name: null
  ok:
    val:
      name: (v) -> isNull(v) || (!isEmpty(v) && isString(v))
})
```

### Create
```coffeescript
john = Person.create({
  val:
    name: 'John Doe'
})
```

### Validate
```coffeescript
john.ok()
john.ok(['val.name'])
```

### Save
```coffeescript
await john.save().write()
```

### Update
```coffeescript
await john.update(['val.name']).write()
```

### Upsert
```coffeescript
await john.upsert(['val.name']).write()
```

### Delete
```coffeescript
await john.del().write()
```

### Get
```coffeescript
await Person.get('id').read()
```

### Find
```coffeescript
await Person.find([
  ['where', 'name', '==', 'John']
]).read()
```

### List
```coffeescript
await Person.list([
  ['where', 'name', '>', 'J'],
  ['order_by', 'name']
], ['meta.id', 'val.name']).read()
```

### Write Transaction
```coffeescript
await Flame.write([
  a.save()
  b.update()
  c.del()
])
```

