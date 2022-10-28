rejects = (fn, err) ->
  try
    await fn()
    ok = false
  catch e
    # console.log e
    ok = (e.message == err)
  return ok

module.exports = rejects