var connection = require('../models/connection');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connection;
var connectionDB = {};

db.once('error', function(err){console.log('DB Connection Error');throw err;});

db.once('open', function(){
    let connectionSchema = new Schema({
        connId: {
            type: String,
            required: 'Connection Id is Required!'
        },
        title: String,
        category: String,
        details: String,
        date: String,
        time: String,
        location: String,
        userId: String,
        noOfPpl: Number,
        connImage: String
    });
    
    let connectionModel = mongoose.model('connection', connectionSchema);
     connectionDB.getConnections = function(){
        return connectionModel.find().exec();
    }
    connectionDB.getConnection = function(connectionId){
        return connectionModel.findOne({connId: connectionId}).exec();
    }
    let categories = ['Food and Drinks','Music'];
    connectionDB.getCategories = function(){
        return categories;
    }

    connectionDB.addConnection = function(connection){
        return connectionModel.create(connection);
    }
});

module.exports = connectionDB;