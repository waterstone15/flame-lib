de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

_            = require 'lodash'
{ all }      = require 'rsvp'
{ DateTime } = require 'luxon'


(->

  FL = require('@/lib/flame-lib')

  FL.register({
    'main':
      service_account: JSON.parse(process.env.FIREBASE_CONFIG)
      pluralize: true
      prefix: true
  })
  flame = await FL.ignite('main')
  db = flame.wildfire().firestore()

  Thing = flame.shape('thing', {
    data:
      rel:
        a: null
      val:
        b: null
    validators:
      rel:
        a: (v) -> true
      val:
        b: (v) -> true
  })


  ts = await Thing.list().read()
  ids = _.map(ts, (_t) -> _t.meta.id)

  tss = await Thing.getAll(ids).read()

  return
)()









