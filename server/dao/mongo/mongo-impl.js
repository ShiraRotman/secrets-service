const mongoose = require('mongoose')

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

SecretSchema.statics.persist = function (tenant, key, value) {
	return MongoSecret.findOneAndUpdate({ tenant: tenant, key: key },
		{ $set: { tenant: tenant, key: key, value: value } },
		{ upsert: true });
}

SecretSchema.statics.findByKey = function (tenant, key) {
	return MongoSecret.findOne({ tenant: tenant, key: key }).lean();
}

const MongoSecret = mongoose.model("Secret",SecretSchema,"secrets");
module.exports = {
	connect: MongoSecret.connect,
	persist: MongoSecret.persist,
	findByKey: MongoSecret.findByKey
};
