de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai     = require 'chai'
assert   = chai.assert

FL       = require '@/lib/flame-lib'
rejects  = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'

map      = require 'lodash/map'
{ all }  = require 'rsvp'

describe 'Shape → spark() -', ->

  it 'an instance of a shape can be created', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape.')
    return

  it 'multiple instances of a shape can be created', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      t2 = Thing.spark({ val: { hello: 'bananas' }})

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape.')
    return

describe 'Shape → get() -', ->
  this.slow(1000)

  it 'a spark can be retrieved from firestore', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: null }}})
      t1 = Thing.spark({ val: { hello: 'world' }})
      await t1.save().write()

      t2 = await Thing.get(t1.obj().meta.id).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading a spark from firestore.')
    return

  it 'a flat (ungrouped) spark can be retrieved from firestore', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: null }}, { group: false })
      t1 = Thing.spark({ hello: 'world' })
      await t1.save().write()

      t2 = await Thing.get(t1.obj().id).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading an flat (ungrouped) spark from firestore.')
    return


describe 'Shape → getAll() -', ->
  this.slow(1000)

  it 'multiple sparks can be retrieved from firestore with ids', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: null }}})

      t1 = Thing.spark({ val: { hello: 'world' }})
      await t1.save().write()

      t2 = Thing.spark({ val: { hello: 'world 2' }})
      await t2.save().write()

      ts = await Thing.getAll([ t1.obj().meta.id, t2.obj().meta.id ]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading multiple sparks from firestore.')
    return

  it 'multiple flat (ungrouped) sparks can be retrieved from firestore with ids', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: null }}, { group: false })

      t1 = Thing.spark({ hello: 'world' })
      await t1.save().write()

      t2 = Thing.spark({ hello: 'world 2' })
      await t2.save().write()

      ts = await Thing.getAll([ t1.obj().id, t2.obj().id ]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading multiple flat (ungrouped) sparks from firestore.')
    return

describe 'Shape → find() -', ->
  this.slow(1000)

  it 'a spark can be retrieved from firestore with a query', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: null }}})

      t1 = Thing.spark({ val: { hello: 'world' }})
      await t1.save().write()

      t2 = await Thing.find([[ 'where', 'val.hello', '==', 'world' ]]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when finding a spark in firestore.')
    return

  it 'a flat (ungrouped) spark can be retrieved from firestore with a query', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: null }}, { group: false })

      t1 = Thing.spark({ hello: 'world' })
      await t1.save().write()

      t2 = await Thing.find([[ 'where', 'hello', '==', 'world' ]]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when finding a flat (ungrouped) spark in firestore.')
    return

describe 'Shape → list() -', ->
  this.slow(1000)

  it 'multiple sparks can be retrieved from firestore with a query', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: null }}})

      t1 = Thing.spark({ val: { hello: 'world' }})
      await t1.save().write()

      t2 = Thing.spark({ val: { hello: 'world 2' }})
      await t2.save().write()

      ts = await Thing.list([[ 'where', 'val.hello', '>=', 'world' ]]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading multiple sparks from firestore.')
    return

  it 'multiple flat (ungrouped) sparks can be retrieved from firestore with a query', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: null }}, { group: false })

      t1 = Thing.spark({ hello: 'world' })
      await t1.save().write()

      t2 = Thing.spark({ hello: 'world 2' })
      await t2.save().write()

      ts = await Thing.list([[ 'where', 'hello', '>=', 'world' ]]).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading multiple flat (ungrouped) sparks from firestore.')
    return


describe 'Shape → page() -', ->
  this.slow(1000)

  it 'a page of sparks can be retrieved from firestore', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: null }}})


      await all(map([0..5], (_i) ->
        tt = Thing.spark({ val: { hello: _i }})
        await tt.save().write()
        return
      ))

      ts = await Thing.page({ size: 2 }).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading a page of sparks from firestore.')
    return

  it 'multiple flat (ungrouped) sparks can be retrieved from firestore with a query', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: null }}, { group: false })


      await all(map([0..5], (_i) ->
        tt = Thing.spark({ hello: _i })
        await tt.save().write()
        return
      ))

      ts = await Thing.page({ size: 2 }).read()
      await Flame.erase('/things')
      return

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when reading a page of flat (ungrouped) sparks from firestore.')
    return

describe 'Shape → extend() -', ->
  this.slow(1000)

  it '', ->

