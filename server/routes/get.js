const Secret = require('mongoose').model('Secret')

module.exports = function getSecret (req, res) {
  const body = req.body || {}

  if (!(body.key && body.token)) {
    return res.status(400).end()
  }

  return Secret.findAndDecrypt(req.headers.tenant, body.key, body.token)
    .then(secret => {
      res.status(200).jsonp(secret).end()
    })
    .catch(() => {
      return res.status(400).end()
    })
}
