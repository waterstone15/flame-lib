resolves = (fn) ->
  try
    await fn()
    ok = true
  catch e
    ok = false
  return ok

module.exports = resolves
