resolves = (fn) ->
  try
    await fn()
    ok = true
  catch e
    # console.log e
    ok = false
  return ok

module.exports = resolves
