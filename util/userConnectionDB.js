var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db = mongoose.connection;
var UserProfile = require('../models/userProfile');
var UserConnection = require('../models/userConnection');
var connectionDB = require('./connectionDB');
var userConnectionDB = {};

db.once('error', function(err){console.log('DB Connection Error');throw err;});

db.once('open', function(){
    let userProfsSchema = new Schema({        
        uId: {
            type: Number,
            required: 'Connection Id is Required!'
        },
        userConnections: [{
            connId: String,
            rsvp: String
        }]        
    });
    
    let userProfilesModel = mongoose.model('userprofile', userProfsSchema);
    userConnectionDB.getUserProfile = function(userId){
        return userProfilesModel.findOne({uId: userId}).exec();
    };
    userConnectionDB.addRSVP = function(connectionID, userID, rsvp_arg){
        return userProfilesModel.findOne({uId: userID}).then(function(userProfile){
            let userConns = userProfile.userConnections;
            userConns.push({connId: connectionID, rsvp: rsvp_arg});
            userProfile.userConnections = userConns;
            return userProfile.save();
        });
    };
    userConnectionDB.updateRSVP = function(connectionID,userID, rsvp_arg){
        return userProfilesModel.findOne({uId: userID}).then(function(userProfile){
            let userConns = userProfile.userConnections;            
            userConns.forEach((userConn) => {
                if(userConn.connId === connectionID){
                    userConn.rsvp = rsvp_arg;
                }
            });
            userProfile.userConnections = userConns;                       
            return userProfile.save();
        });
    };
    userConnectionDB.removeUserConn = function(connectionID, userID){
        return userProfilesModel.findOne({uId: userID}).then(function(userProfile){
            let userConns = userProfile.userConnections;
            let connIdArray = userConns.map(userConn => {return userConn.connId});
            userConns.splice(connIdArray.indexOf(connectionID),1);
            userProfile.userConnections = userConns;
            return userProfile.save();
        });
    };
    //Logic to add new connection is in connectionDB as it is convenient to execute it there.
    userConnectionDB.addConnection = function(connection){
        return connectionDB.addConnection(connection);
    }
});

module.exports = userConnectionDB;