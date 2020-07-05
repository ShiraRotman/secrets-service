const Secret = require('../models/secrets')

module.exports = function setSecret (req, res) {
  const body = req.body || {}

  if (!(body.key && body.value && body.token)) {
    return res.status(400).end()
  }

  Secret.findByKey(req.headers.tenant, body.key)
    .then(secret => secret || new Secret(), () => new Secret())
    .then(secret => secret.encrypt(req.headers.tenant, body.key, body.value, body.token))
    .then(() => {
      return res.status(200).json({ key: body.key }).end()
    })
    .catch((err) => {
      return res.status(400).json().end()
    })
}
