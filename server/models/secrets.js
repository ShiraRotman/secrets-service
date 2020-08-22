const crypto=require("crypto");
const config=require('../../config');

module.exports=(function()
{
	//TODO: The IV should be random! Use crypto.randomBytes!
	const lv = new Buffer('0102030405060708', 'binary');
	
	function Secret(persistImpl)
	{
		if (!persistImpl)
			throw new ReferenceError("A persistence implementation must be supplied!");
		else if ((!persistImpl.persist)||(!persistImpl.findByKey))
			throw new TypeError("The persistence object must implement save and findOne methods!");
		
		this.persistImpl=persistImpl;
		if (persistImpl.connect) persistImpl.connect(config.persistenceUri);
	}
	
	Secret.prototype.encrypt = function (tenant, key, value, userToken) {
		const hashedKey=hashSecretKey(tenant + key);
		const encryptedValue=encrypt({ key, value, userToken }, config.secretKey + 
				key + userToken + tenant);
		return this.persistImpl.persist(tenant,hashedKey,encryptedValue);
	};
	
	Secret.prototype.findAndDecrypt = function (tenant, key, userToken) 
	{
		return new Promise((resolve,reject) => 
		{
			this.persistImpl.findByKey(tenant, hashSecretKey(tenant + key)).
					then(secret => decrypt(secret.value, config.secretKey + key + 
					userToken + tenant)).then(decoded => 
			{
				if (!(decoded.key === key && decoded.userToken === userToken)) {
					reject();
				}
				return resolve({
					key,
					value: decoded.value
				});
			}).catch(err => reject(err));
		});
	};
	
	function hashSecretKey (text) {
		return crypto.createHash("sha256").update(text + config.secretKey).digest("hex");
	}

	function encrypt (data, secret) {
		const cipher = crypto.createCipheriv('aes256', getValidSecret(secret), lv)
		return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex')
	}

	function decrypt (encrypted, secret) {
		const decipher = crypto.createDecipheriv('aes256', getValidSecret(secret), lv)
		return JSON.parse(decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'))
	}
	
	function getValidSecret (secret) {
		if (secret.length === 32) {
			return secret
		}
		return crypto.createHash('sha256').update(secret).digest('base64').substr(0, 32)
	}
	
	return Secret;
})();
