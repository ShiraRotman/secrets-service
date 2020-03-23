const Secret = require('mongoose').model('Secret')

module.exports = function setSecret (req, res) {
  const body = req.body || {}

  if (!(body.key && body.value && body.token)) {
    return res.status(400).end()
  }

  Secret.findByKey(body.key)
    .then(secret => secret || new Secret(), () => new Secret())
    .then(secret => secret.encrypt(body.key, body.value, body.token))
    .then(() => {
      return res.status(200).jsonp({ key: body.key }).end()
    })
    .catch((err) => {
      return res.status(400).jsonp().end()
    })
}
