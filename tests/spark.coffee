de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai = require 'chai'
assert = chai.assert

FL = require '@/lib/flame-lib'
rejects = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'

isEmpty = require 'lodash/isEmpty'


describe 'Spark → obj() -', ->

  it 'a spark can be converted into a plain javascript object', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.obj().val.hello == 'banana'

    ok = await fn()
    assert(ok)
    return

  it 'a flat (ungrouped) spark can be converted into a plain javascript object', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.obj().hello == 'banana'

    ok = await fn()
    assert(ok)
    return

describe 'Spark → ok() -', ->
  it 'a valid spark returns true when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.ok() == true

    ok = await fn()
    assert(ok)
    return

  it 'a valid flat (ungrouped) spark returns true when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.ok() == true

    ok = await fn()
    assert(ok)
    return

  it 'an invalid spark returns false when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}, validators: { val: { hello: (_d) -> false }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.ok() == false

    ok = await fn()
    assert(ok)
    return

  it 'an invalid flat (ungrouped) spark returns false when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }, validators: { hello: (_d) -> false }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.ok() == false

    ok = await fn()
    assert(ok)
    return

  it 'a single valid spark field returns true when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.ok([ 'val.hello' ]) == true

    ok = await fn()
    assert(ok)
    return

  it 'a single valid flat (ungrouped) spark field returns true when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.ok([ 'hello' ]) == true

    ok = await fn()
    assert(ok)
    return

  it 'a single invalid spark returns false when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}, validators: { val: { hello: (_d) -> false }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.ok([ 'val.hello' ]) == false

    ok = await fn()
    assert(ok)
    return

  it 'a single invalid flat (ungrouped) spark returns false when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }, validators: { hello: (_d) -> false }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.ok([ 'hello' ]) == false

    ok = await fn()
    assert(ok)
    return

describe 'Spark → errors() -', ->
  it 'a valid spark returns no errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return isEmpty(t1.errors())

    ok = await fn()
    assert(ok)
    return

  it 'a valid flat (ungrouped) spark returns no errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return isEmpty(t1.errors())

    ok = await fn()
    assert(ok)
    return

  it 'an invalid spark returns errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}, validators: { val: { hello: (_d) -> false }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.errors().val.hello == true

    ok = await fn()
    assert(ok)
    return

  it 'an invalid flat (ungrouped) spark returns errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }, validators: { hello: (_d) -> false }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.errors().hello == true

    ok = await fn()
    assert(ok)
    return

  it 'a single valid spark field returns no errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return isEmpty(t1.errors([ 'val.hello' ]))

    ok = await fn()
    assert(ok)
    return

  it 'a single valid flat (ungrouped) spark field returns no errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return isEmpty(t1.errors([ 'hello' ]))

    ok = await fn()
    assert(ok)
    return

  it 'a single invalid spark field returns errors', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { val: { hello: 'world' }}, validators: { val: { hello: (_d) -> false }}})
      t1 = Thing.spark({ val: { hello: 'banana' }})
      return t1.errors([ 'val.hello' ]).val.hello == true

    ok = await fn()
    assert(ok)
    return

  it 'a single invalid flat (ungrouped) spark returns false when validated', ->
    fn = ->
      await FL.purge()
      FL.register({ 'main': { service_account: JSON.parse(process.env.FIREBASE_CONFIG) } })
      Flame = await FL.ignite('main')
      Thing = Flame.shape('thing', { data: { hello: 'world' }, validators: { hello: (_d) -> false }}, { group: false })
      t1 = Thing.spark({ hello: 'banana' })
      return t1.errors([ 'hello' ]).hello == true

    ok = await fn()
    assert(ok)
    return

describe 'Spark → save() -', ->
  it '', ->

describe 'Spark → update() -', ->
  it '', ->

describe 'Spark → del() -', ->
  it '', ->
