de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai = require 'chai'
chaiAsPromised = require 'chai-as-promised'

chai.use(chaiAsPromised)
assert = chai.assert

FL = require 'flame-lib'

rejects = (fn, err) ->
  try
    await fn()
    ok = false
  catch e
    ok = (e.message == err)
  return ok

resolves = (fn) ->
  try
    await fn()
    ok = true
  catch e
    ok = false
  return ok

describe 'FlameLib', ->

  beforeEach ->
    FL.purge()
    return

  describe '→ register() -', ->

    it 'a new app can be registered', ->
      fn = ->
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })

      assert.doesNotThrow(fn)
      return

    it 'two apps with the same name can not be registered', ->
      err = "'main' is already registered in Flame."
      fn = ->
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })

      assert.throws(fn, err)
      return


  describe '→ quench() -', ->

    it 'a registered app can be quenched', ->
      fn = ->
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
        await FL.quench('main')
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
        return

      ok = await resolves(fn)
      assert(ok, 'An error should not be thrown.')
      return


  describe '→ ignite() -', ->

    it 'a registered app can be accessed if not yet initalized', ->
      fn = ->
        Flame = await FL.ignite('main')

      assert.doesNotThrow(fn)
      return

    it 'a registered app can be accessed if already initalized', ->
      fn = ->
        throw new Error('bla')
        FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
        Flame = await FL.ignite('main')
        Flame = await FL.ignite('main')

      ok = await resolves(fn)
      assert(ok, 'An error should not be thrown.')
      return

    it 'a unregistered app cannot be accessed and throws an error', ->
      err = "'bad' is not registered in Flame."
      fn = ->
        Flame = await FL.ignite('bad')

      ok = await rejects(fn, err)
      assert(ok, 'An error should be thrown.')
      return





# _            = require 'lodash'
# { all }      = require 'rsvp'
# { DateTime } = require 'luxon'


# (->

#   FL = require('@/lib/flame-lib')

#   FL.register({
#     'main':
#       service_account: JSON.parse(process.env.FIREBASE_CONFIG)
#       pluralize: true
#       prefix: true
#   })
#   Flame = await FL.ignite('main')
#   db = Flame.wildfire().firestore()

#   Thing = Flame.shape('thing', {
#     data:
#       rel:
#         a: null
#       val:
#         b: null
#     validators:
#       rel:
#         a: (v) -> true
#       val:
#         b: (v) -> true
#   })


#   ts = await Thing.list().read()
#   ids = _.map(ts, (_t) -> _t.meta.id)

#   tss = await Thing.getAll(ids).read()

#   return
# )()









