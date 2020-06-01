const mongoose = require('mongoose')
const crypto = require('crypto')
const { sha256 } = require('sha.js')
const { jwtSecret } = require('../../config')

// define the Secret model schema
const SecretSchema = new mongoose.Schema({
  tenant: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  value: String,
})

SecretSchema.index({ tenant: 1, key: 1 }, { unique: true })

SecretSchema.methods.encrypt = function (tenant, key, value, userToken) {
  this.key = hashSecretKey(tenant + key)
  this.value = encrypt({ key, value, userToken }, jwtSecret + key + userToken + tenant)

  return this.save()
}

SecretSchema.statics.findAndDecrypt = function findAndDecrypt (tenant, key, userToken) {
  return this.findByKey(tenant, key)
    .lean()
    .then(secret => decrypt(secret.value, jwtSecret + key + userToken + tenant))
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

SecretSchema.statics.findByKey = function decrypt (tenant, key) {
  return this.findOne({ key: hashSecretKey(tenant + key), tenant })
}

function hashSecretKey (text) {
  return new sha256().update(text + jwtSecret).digest('hex')
}

function encrypt (data, secret) {
  const cipher = crypto.createCipheriv('aes256', secret, '0102030405060708')
  return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex')
}

function decrypt (encrypted, secret) {
  const decipher = crypto.createDecipheriv('aes256', secret, '0102030405060708')
  return JSON.parse(decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'))
}

module.exports = mongoose.model('Secret', SecretSchema)
