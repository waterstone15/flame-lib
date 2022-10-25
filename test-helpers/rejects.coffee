rejects = (fn, err) ->
  try
    await fn()
    ok = false
  catch e
    ok = (e.message == err)
  return ok

module.exports = rejects