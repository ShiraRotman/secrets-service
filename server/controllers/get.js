const Secret = require('../models/secrets')

module.exports = function getSecret (req, res) {
  const body = req.body || {}

  if (!(body.key && body.token)) {
    return res.status(400).json({ message: 'you are not authorized' }).end()
  }

  return Secret.findAndDecrypt(req.headers.tenant, body.key, body.token)
    .then(secret => {
      res.status(200).json(secret).end()
    })
    .catch(() => {
      return res.status(400).end()
    })
}
