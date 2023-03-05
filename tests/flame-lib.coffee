de = require 'dotenv'
(de.config {  path: '.env' })

ma = require 'module-alias'
(ma.addAlias '@', __dirname + '../../')

chai = require 'chai'
assert = chai.assert

FL = require '@/lib/flame-lib'
rejects = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'


describe 'FlameLib → register() -', ->

  it 'a new app can be registered', ->
    fn = ->
      await FL.purge()
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })

    ok = (await resolves fn)
    (assert ok, 'An error should not be thrown when registering a new app.')
    return

  it 'two apps with the same name can not be registered', ->
    err = "'main' is already registered in Flame."
    fn = ->
      await FL.purge()
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })

    ok = (await rejects fn, err)
    (assert ok, 'An error should not be thrown when registering two apps with the same name.')
    return


describe 'FlameLib → quench() -', ->

  it 'a registered app can be quenched', ->
    fn = ->
      await FL.purge()
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })
      (await FL.quench 'main')
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })
      return

    ok = (await resolves fn)
    (assert ok, 'An error should not be thrown when quenching a registered app.')
    return


describe 'FlameLib → ignite() -', ->

  it 'a registered app can be accessed if not yet initalized', ->
    fn = ->

      await FL.purge()
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })
      Flame = (FL.ignite 'main')

    ok = (await resolves fn)
    (assert ok, 'An error should not be thrown when accessing a registered, but not yet initalized, app.')
    return

  it 'a registered app can be accessed if already initalized', ->
    fn = ->
      await FL.purge()
      (FL.register { 'main': { service_account: (JSON.parse process.env.FIREBASE_CONFIG) } })
      Flame = (FL.ignite 'main')
      Flame = (FL.ignite 'main')

    ok = (await resolves fn)
    (assert ok, 'An error should not be thrown.')
    return

  it 'a unregistered app cannot be accessed and throws an error', ->
    err = "'main' is not registered in Flame."
    fn = ->
      await FL.purge()
      Flame = (FL.ignite 'main')

    ok = (await rejects fn, err)
    (assert ok, 'An error should be thrown.')
    return

