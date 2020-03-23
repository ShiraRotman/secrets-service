const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const { sha256 } = require('sha.js')
const { jwtSecret } = require('../../config')

// define the Secret model schema
const SecretSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: String,
})

SecretSchema.methods.encrypt = function encrypt (key, value, userToken) {
  this.key = hashSecretKey(key)
  this.value = jwt.sign({ key, value, userToken }, jwtSecret + key + userToken)

  return this.save()
}

SecretSchema.statics.findAndDecrypt = function decrypt (key, userToken) {
  return this.findByKey(key)
    .lean()
    .then(secret => verify(secret.value, jwtSecret + key + userToken))
    .then(decoded => {
      if (!(decoded.key === key && decoded.userToken === userToken)) {
        return Promise.reject()
      }
      return {
        key,
        value: decoded.value
      }
    })
}

SecretSchema.statics.findByKey = function decrypt (key) {
  return this.findOne({ key: hashSecretKey(key) });
}

function verify (key, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(key, secret, (err, decoded) => {
      if (err || !decoded) {
        reject()
      } else {
        resolve(decoded)
      }
    })
  })
}

function hashSecretKey (text) {
  return new sha256().update(text + jwtSecret).digest('hex')
}

module.exports = mongoose.model('Secret', SecretSchema)
