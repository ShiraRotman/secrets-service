
const MONGO_URI=process.env.MONGO_URI || 'mongodb://localhost/secrets-service';

module.exports = {
  mongoUri: MONGO_URI,
  secretKey: process.env.SECRET || 'secrets-service-secret',
  internalSecret: process.env.INTERNAL_SECRET || 'no one can access this service without it',
}
