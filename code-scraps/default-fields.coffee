{ DateTime } = require 'luxon'

now = DateTime.local().setZone('utc')

fields =
  ext: {}
  index: {}
  meta:
    collection: (fields) -> fields.meta.collection ? pluralize(fields.meta.type)
    created_at: -> now.toISO()
    deleted: false
    idempotency_key: null
    id: (fields) -> "#{fields.meta.type}-#{rand.randomString(32)}"
    subtype: null
    type: (fields) -> fields.meta.type
    updated_at: -> now.toISO()
    v: 1
  rel: {}
  val: {}