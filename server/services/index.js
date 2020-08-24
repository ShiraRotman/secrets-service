const mongoose = require('mongoose');
const mongoImpl = require('../dao/mongo/mongo-impl');
const { mongoUri } = require('../../config');

const Secret = require('./secrets');
mongoose.Promise = global.Promise;

mongoose.connect(mongoUri,
{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connection.on('error', (err) => {
	console.error(`Mongoose connection error: ${err}`);
	process.exit(1);
});

module.exports = new Secret(mongoImpl);