de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai = require 'chai'
assert = chai.assert

FL = require '@/lib/flame-lib'
rejects = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'

describe 'Flame → shape() -', ->

  it 'a shape can be created', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape.')
    return


  it 'a flat (ungrouped) shape can be created', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a flat shape.')
    return

  it 'a shape can be created with computed fields', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data:
          val:
            hello: 'world'
            hello: (_d) -> 'Hello' + _d.val.hello
      })

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape with computed fields.')
    return

  it 'a flat (ungrouped) shape can be created with computed fields', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data:
          hello: 'world'
          hello: (_d) -> 'Hello' + _d.val.hello
      }, { group: false })

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape with computed fields.')
    return

  it 'a shape can be created with custom validators', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data: { val: { hello: 'world' }}
        validators: { val: { hello: (_v) -> true }}
      })

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape with custom validators.')
    return

  it 'a flat (ungrouped) shape can be created with custom validators', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data: { hello: 'world' }
        validators: { hello: (_v) -> true }
      })

    ok = await resolves(fn)
    assert(ok, 'An error should not be thrown when creating a shape with custom validators.')
    return

  it 'a shape can not be created with bad validators', ->
    err = 'Every validator must be a function that takes one argument.'
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data: { val: { hello: 'world' }}
        validators: { val: { hello: () -> true }}
      })

    ok = await rejects(fn, err)
    assert(ok, 'An error should be thrown when creating a shape with arity != 1.')
    return

  it 'a flat (ungrouped) shape can not be created with bad validators', ->
    err = 'Every validator must be a function that takes one argument.'
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = FL.ignite('main')
      Thing = Flame.shape('thing', {
        data: { hello: 'world' }
        validators: { hello: () -> true }
      }, { group: false })

    ok = await rejects(fn, err)
    assert(ok, 'An error should be thrown when creating a shape with arity != 1.')
    return