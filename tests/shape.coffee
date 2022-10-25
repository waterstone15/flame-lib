de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai = require 'chai'
assert = chai.assert

FL = require '@/lib/flame-lib'
rejects = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'

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
  it '', ->

describe 'Shape → getAll() -', ->
  it '', ->

describe 'Shape → find() -', ->
  it '', ->

describe 'Shape → list() -', ->
  it '', ->

describe 'Shape → find() -', ->
  it '', ->

describe 'Shape → page() -', ->
  it '', ->

describe 'Shape → extend() -', ->
  it '', ->
