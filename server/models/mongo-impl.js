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

SecretSchema.statics.persist = function (tenant, key, value) 
{
	return new Promise(function(resolve,reject)
	{
		MongoSecret.findOne({ tenant: tenant, key: key }).then(function(secret)
		{
			if (!secret) secret=new MongoSecret();
			secret.tenant = tenant; secret.key = key; secret.value = value;
			secret.save().then(() => resolve()).catch(err => reject(err));
		}).catch(err => reject(err));
	});
}

SecretSchema.statics.findByKey = function (tenant, key) {
	return MongoSecret.findOne({ tenant: tenant, key: key }).lean();
}

SecretSchema.statics.connect=function(mongoUri)
{ 
	return mongoose.connect(mongoUri,
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
};

const MongoSecret=mongoose.model("MongoSecret",SecretSchema,"secrets");
mongoose.Promise = global.Promise;

mongoose.connection.on('error', (err) => {
	console.error(`Mongoose connection error: ${err}`);
	process.exit(1);
});

module.exports=
{ 
	connect: MongoSecret.connect,
	persist: MongoSecret.persist,
	findByKey: MongoSecret.findByKey
};
