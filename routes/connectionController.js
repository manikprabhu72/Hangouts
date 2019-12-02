var express = require('express');
var connection = require('../models/connection');
var connectionDB = require('../util/connectionDB');
var userDB = require('../util/userDB');
var router = express.Router();

var connections = [];
var categories;

router.get('/newConnection', function(req,res){
    //if user logged in redirect to new connection page else do the login and show savedConnections
    if(req.session.theUser){
        res.render('newConnection',{errs: []});
    } else{
        res.redirect('/profile/savedConnections');
    }
});

router.use('/', function(req,res,next){
    if(Object.keys(connectionDB).length === 0){
        console.log('Error Connecting to MongoDB');
        return res.render('connections', {connections: connections, message: 'Internal Error Database Connection'});
    }
    categories = connectionDB.getCategories();
    try{
        connectionDB.getConnections().then(function(conns){            
            connections = conns;
            next();
        });
    } catch(e){
        console.log('Error Fetching Connections from MongoDB');
        return res.render('connections', {connections: connections, message: 'Internal Error Fetching Connections'});
    }
    
});

router.get('/',function(req, res){
    var query = req.query;
    // if query not null and have a valid connectionId param render connection view otherwiese render connections view
    if(Object.keys(query).length != 0){
        if ('connId' in query && validateConnId(query.connId)){
            try{
                if(Object.keys(userDB).length != 0){                
                    connectionDB.getConnection(query.connId).then(function(connection){                                               
                        userDB.getUserById(connection.userId).then(function(user){                          
                            res.render('connection',{connection: connection, host: user});
                        });
                        
                    });
                }else{
                    res.redirect('/connections');
                }
            } catch(e){
                console.log('Error Fetching Connection Detail/User Details from MongoDB');
                return res.render('connections', {connections: connections, message: 'Internal Error Fetching Connection Detail'});
            }           
        }else{
            res.redirect('/connections');
        }
    } else{        
        res.render('connections', {connections: connections, categories: categories});
    }
});

// POST request to handle requests from savedConnections page
router.post('/',function(req,res){
    res.render('connections',{connections: connections, categories: categories});
});

var validateConnId = function(connId){
    var result = false;
    // connection Id should start with HO (as in my app name Hangouts) and followed 4 numbers.
    var myRegex = '^HO[0-9]{4}';
    //check the connId format and check if the connId exists in connections data
    if(String(connId).match(myRegex) && connections.some(connection => connection.connId === connId)){
        result = true;
    }
    return result;
}

module.exports=router;