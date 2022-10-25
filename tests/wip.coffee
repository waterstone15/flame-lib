de = require 'dotenv'
de.config({  path: '.env' })

ma = require 'module-alias'
ma.addAlias('@', __dirname + '../../')

chai = require 'chai'
assert = chai.assert

FL = require '@/lib/flame-lib'
rejects = require '@/test-helpers/rejects'
resolves = require '@/test-helpers/resolves'

describe 'WIP', ->

  it '::', ->
    assert(true)
    return
