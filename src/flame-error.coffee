class FlameError extends Error
  constructor: (_message) ->
    super(_message)
    @name = "FlameError"
    return

module.exports = FlameError
