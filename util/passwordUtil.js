var crypto = require('crypto');

var getSalt = function(){
    return crypto.randomBytes(8).toString('hex').slice(0,16);
}

var getSaltPassAndSalt  = function(salt, password){
    let hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};

module.exports = {
    getSaltPassAndSalt: getSaltPassAndSalt,
    getSalt: getSalt
};

getSaltPassAndSalt(getSalt(),'pass@123');