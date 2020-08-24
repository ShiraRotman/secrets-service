const Secret = require('../services/index');

module.exports = function getSecret (req, res) {
  const body = req.body || {}

  if (!(body.key && body.token)) {
    return res.status(400).json({ message: 'you are not authorized' }).end()
  }

  return Secret.findAndDecrypt(req.headers.tenant, body.key, body.token)
    .then(result => {
      res.status(200).json(result).end()
    })
    .catch(() => {
      return res.status(400).end() //TODO: Send 404 if the key was not found
    })
}
