var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connection;
var userDB = {};

db.once('error', function(err){console.log('DB Connection Error');throw err;});

db.once('open', function(){
    let userSchema = new Schema({        
        uId: {
            type: Number,
            required: 'Connection Id is Required!'
        },
        fName: String,
        lName: String,
        username: String,
        email: String,
        profPic: String,
        salt: String,
        password: String
    });
    
    let userModel = mongoose.model('user', userSchema);
    userDB.getAllUsers = function(){
        return userModel.find().exec();
    }
    userDB.getUser = function(uName){
        return userModel.findOne({username: uName}).exec();
    }
    userDB.getUserById = function(userId){
        return userModel.findOne({uId: userId}).exec();
    }
});

module.exports = userDB;
