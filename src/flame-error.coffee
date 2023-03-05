
class FlameError extends Error
  
  constructor: (...args) ->
    (super ...args)
    @.name = "FlameError"
    return

module.exports = FlameError
