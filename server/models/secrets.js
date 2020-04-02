const mongoose = require('mongoose')
const crypto = require('crypto')
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

SecretSchema.methods.encrypt = function (key, value, userToken) {
  this.key = hashSecretKey(key)
  this.value = encrypt({ key, value, userToken }, jwtSecret + key + userToken)

  return this.save()
}

SecretSchema.statics.findAndDecrypt = function findAndDecrypt (key, userToken) {
  return this.findByKey(key)
    .lean()
    .then(secret => decrypt(secret.value, jwtSecret + key + userToken))
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
  return this.findOne({ key: hashSecretKey(key) })
}

function hashSecretKey (text) {
  return new sha256().update(text + jwtSecret).digest('hex')
}

function encrypt (data, secret) {
  const cipher = crypto.createCipher('aes256', secret)
  return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex')
}

function decrypt (encrypted, secret) {
  const decipher = crypto.createDecipher('aes256', secret);
  return JSON.parse(decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'));
}

module.exports = mongoose.model('Secret', SecretSchema)
