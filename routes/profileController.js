var express = require('express');
var connection = require('../models/connection');
var User = require('../models/user');
var connectionDB = require('../util/connectionDB');
var userDB = require('../util/userDB');
var UserConnection = require('../models/userConnection');
var userConnectionDB = require('../util/userConnectionDB');
var bodyParser = require('body-parser');
var passwordUtil = require('../util/passwordUtil');
var { body,sanitizeBody, validationResult } = require('express-validator');
var moment = require('moment');

var router = express.Router();
var urlencodedParser = bodyParser.urlencoded({extended: true});
var savedUserConns = [];
var savedConnIdArr = [];
var actnValues = ['save', 'updateProfile', 'updateRSVP', 'delete', 'signout', 'signIn'];
var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];

//route for getting signup page
router.get('/signup',function(req,res){
    res.render('signup', {errs: []});
});

//route for the submitting signup page
/*
Added validations for the form fields and sanitized the values.
*/
router.post('/signup',urlencodedParser,[
    sanitizeBody(['fName','lName','email','uName','password','confirmPass']).trim(),
    body(['fName','lName','email','uName','password','confirmPass']).exists().not().isEmpty().withMessage('Field Value Cannot be Empty'),
    body(['fName','lName','email','uName','password','confirmPass']).isLength({min: 2, max: 100}).withMessage('Invalid Length for the fields'),
    body('email').isEmail().withMessage('Invalid Email Address'),
    body('uName').custom(uName => {
        return userDB.getUser(uName).then(function(user){
            if(!user){
                return true;
            }else{
                return Promise.reject('Username should be unique. Try different username');
            }
        })
    }),
    body('confirmPass').custom((confirmPass, { req }) => {
        if(confirmPass !== req.body.password){
            return Promise.reject('Confirm Password and Password should be same');
        }else{
            return true;
        }
    })
],function(req,res){
    const errors = validationResult(req);
    //check errors and if exists redirect to signup page with errors
    if (!errors.isEmpty()) {    
        return res.render('signup', {errs: errors.errors});        
    }

    //getting salted and hased user entered password and storing it in DB
    let saltAndPass = passwordUtil.getSaltPassAndSalt(passwordUtil.getSalt(),req.body.password);
    userDB.getAllUsers().then(function(users){       
        let usr = new User((users.length)+1001,req.body.fName, req.body.lName, req.body.uName, req.body.email, "/assets/images/hostPic.jpeg", saltAndPass.passwordHash, saltAndPass.salt);
        console.log(usr);
        return userDB.addUser(usr);
    }).then(function(user){
        req.session.theUser = user;
        return res.redirect('/profile/savedConnections');
    });    
});

//route to login
router.get('/login',function(req,res){
    return res.render('login', {errs: []});
});

/*route for handling login
along with validations and sanitizing the values
*/
router.post('/login',urlencodedParser,[
    sanitizeBody('username').trim(),
    sanitizeBody('password').trim(),
    body().custom((val, { req })=>{
        let query = req.query;        
        if(!(query && 'action' in query && actnValues.includes(query.action))){
            return Promise.reject('Invalid Request');
        }
        if(!(query.action == actnValues[5])){
            return Promise.reject('Invalid Request');
        }
        return true;
    }),
    body(['username', 'password']).exists().not().isEmpty().withMessage('Username/Password Cannot be Empty'),
    body('username').custom(username => {
        return userDB.getUser(username).then(function(user){
            if(!user){                                                                         
                return Promise.reject('You have entered incorrect username !!');
            }
        })
    }),    
    body('password').custom((password, { req }) => {
        return userDB.getUser(req.body.username).then(function(user){
            if(user){
                if(!(user.password.match(passwordUtil.getSaltPassAndSalt(user.salt,password).passwordHash))){
                    return Promise.reject('You have entered Incorrect Password !!');           
                } 
            }                                                                                                         
        })
    })], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        return res.render('login', {errs: errors.errors});        
    }           
    return userDB.getUser(req.body.username).then(function(user){                
        req.session.theUser = user;
        return res.redirect('/profile/savedConnections');
    });    

});

//middleware for savedConnections page
router.use('/savedConnections',urlencodedParser, function(req,res, next){
    try{
        if(Object.keys(connectionDB).length === 0 && Object.keys(userDB).length === 0 && Object.keys(userConnectionDB).length === 0){
            console.log('Error Connecting to MongoDB');
            return res.render('connections', {connections: [], message: 'Internal Error Database Connection'});
        }
        let reqBody = req.body;
        //check if the user is logged in, else redirect to login page
        if(req.session.theUser){ 
            user = req.session.theUser;
            return userConnectionDB.getUserProfile(user.uId).then(function(userProf){ 
                savedUserConns = [];
                if(userProf){
                    savedConnIdArr = userProf.userConnections.map(userConn => {return userConn.connId});
                    Promise.all(savedConnIdArr.map(connId => {return connectionDB.getConnection(connId)})).then(function(connections){
                        for(let i = 0; i < connections.length ; i++){
                            //Filtering profiles with any null connection values
                            if(connections[i]!=null){
                                savedUserConns.push( new UserConnection(connections[i],userProf.userConnections[i].rsvp));
                            }                           
                        }                        
                        next();
                    }); 
                }else{
                    next();
                }               
                
            }).catch(err =>{
                throw err;
            });                               
        } else{    
            return res.render('login', {errs: []});                                                                                                                                      
        }
                     
    } catch (err){
        console.log('Error Fetching Users/User Profile from MongoDB '+ err);
        return res.render('connections', {connections: [], message: 'Internal Error Fetching Connections'});
    }
});
//added body-parser to process forms
router.all('/savedConnections',urlencodedParser, function(req,res){
        let query = req.query;
        let reqBody = req.body;
        //valid action values
        let userId = req.session.theUser.uId;                
        //validate if there is action parameter in query and parameter has valid value
        if(query && 'action' in query && actnValues.includes(query['action'])){
            if(req.query.action == actnValues[4]){
                //destroy the session as user action is logged out
                req.session.destroy();
                res.redirect('/');
                return;
            } else{
                // checking for viewConnections to ensure the action is legitimate
                if (reqBody && 'viewConnections' in reqBody && reqBody['viewConnections']){
                    let viewConnections = reqBody['viewConnections'].split(',');
                    let valdiateConns = viewConnections.every(connId => {
                        return String(connId).match('^HO[0-9]{4}')
                    });
                    if('connId' in query && viewConnections.includes(query['connId']) && valdiateConns){
                        if(query['action'] == actnValues[0]){
                            let rsvps = ['yes','no','maybe'];
                            if ('rsvp' in query && rsvps.includes(query['rsvp'])){
                                if(savedConnIdArr.includes(query['connId'])){                                    
                                    return userConnectionDB.updateRSVP(query['connId'],userId,query['rsvp']).then(function(x){
                                        return res.redirect('/profile/savedConnections');
                                    });   
                                }else{
                                    return userConnectionDB.addRSVP(query['connId'],userId,query['rsvp']).then(function(x){
                                        return res.redirect('/profile/savedConnections');
                                    });    
                                }                                
                            } 
                        } else if (query['action'] == actnValues[1]){
                            if(savedConnIdArr.includes(query['connId'])){
                                // redirect to connection page for update button
                                res.redirect('/connections?connId='+query['connId']);
                                res.end();
                                return;
                            } 
                        } else if (query['action'] == actnValues[3]){
                            return userConnectionDB.removeUserConn(query['connId'],userId).then(function(x){
                                return res.redirect('/profile/savedConnections'); 
                            });     
                        }
                    } 
                } 
            }
        }    
        //All cases render to savedConnections
        res.render('savedConnections',{theUser: req.session.theUser, userConns: savedUserConns});    
    
});


/*--***
Route for handling the add connection. 
Along with validations and sanitizing the values.
***---*/
router.post('/saveConnection',urlencodedParser,[
    sanitizeBody(['topic','name','details','where','when']).trim(),
    body(['topic','name','details','where','when']).exists().not().isEmpty().withMessage('Required fields Cannot be Empty'),
    body('topic').custom(topic => {
        if(!(['Food and Drinks', 'Music'].includes(topic))){
            return Promise.reject('Invalid Topic Value');
        }
        return true;
    }),
    body('name').isLength({min: 1, max: 100}).withMessage('Invalid name for the connection: Enter Characters between 1 and 100'),
    body('details').isLength({min:10, max: undefined}).withMessage('Invalid details for the connection: Enter min of 10 Characters'),
    body('when').custom(date =>{        
        if(!(moment(date,'yyyy-mm-dd').isValid())){
            return Promise.reject('Invalid Date: Enter in MM/DD/YYYY format');
        }
        return true;
    }),
    sanitizeBody('when').toDate().customSanitizer(date => {
        if(date){
            return date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear();
        }
        return date;
    })
], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {            
        return res.render('newConnection', {errs: errors.errors});        
    }
    let reqBody = req.body;
    connId = 'HO'+ Math.floor(Math.random() * (9999 - 1100) + 1100);
    conn = connection(connId, reqBody.name, reqBody.topic, reqBody.details, reqBody.when,'07:00 PM to 09:PM', reqBody.where, req.session.theUser.uId,2,'/assets/images/dinner.jpeg');
    userConnectionDB.addConnection(conn).then(function(conn){
        res.redirect('/connections');
    });
});

//route for handling edit and delete connection request.
router.post('/connection', function(req,res){
    let query = req.query;       
    if(query && 'action' in query && 'connId' in query && ['edit','delete'].includes(query.action)){
        if(query.action == 'edit'){
            //get connection details for the user to edit
            connectionDB.getConnection(query.connId).then(function(connection){
                if(connection.date != null){
                    let dateArr = connection.date.split(' ');                
                    connection.date = moment(new Date(dateArr[2], monthNames.indexOf(dateArr[1]), dateArr[0])).format('MM/DD/YYYY');
                }                
                return res.render('editConnection', {connection:connection, errs:[]});
            }); 
        }else{
            connectionDB.removeConnection(query.connId).exec().then(function(data){                
                userConnectionDB.removeConnsFromProf(query.connId).exec().then().catch((err)=> {console.log(err)});                
                res.redirect('/connections');
            }).catch((err) => {
                console.log(err);
                return res.redirect('/connections');
            })
        }
    }else{
        res.redirect('/connections');
    }
})

/*----
    Route for Handling the edit connection request.
    Added validations and sanitized the user entered values.
---*/
router.post('/editConnection',urlencodedParser,[
    sanitizeBody(['name','details','where','when']).trim(),
    body(['name','details','where','when']).exists().not().isEmpty().withMessage('Required fields Cannot be Empty'),    
    body('name').isLength({min: 1, max: 100}).withMessage('Invalid name for the connection'),
    body('details').isLength({min:10, max: undefined}).withMessage('Invalid details for the connection'),
    body('when').custom(date =>{        
        if(!(moment(date,'yyyy-mm-dd').isValid())){
            return Promise.reject('Invalid Date');
        }
        return true;
    }),
    sanitizeBody('when').toDate().customSanitizer(date => {
        if(date){
            return date.getDate()+' '+monthNames[date.getMonth()]+' '+date.getFullYear();
        }
        return date;
    })
],function(req,res){
    let reqBody = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {    
        return connectionDB.getConnection(reqBody.connectionId).then(function(connection){
            if(connection.date != null){
                let dateArr = connection.date.split(' ');                
                connection.date = moment(new Date(dateArr[2], monthNames.indexOf(dateArr[1]), dateArr[0])).format('MM/DD/YYYY');
            }                
            return res.render('editConnection', {connection:connection, errs:errors.errors});
        });            
    }  else{
        //update the user entered values in the DB
        connectionDB.updateConnection(reqBody.connectionId, reqBody.name, reqBody.details,reqBody.when,reqBody.where).exec().then(function(data){
            res.redirect('/connections?connId='+reqBody.connectionId);
        })
    }    
    
})



module.exports = router;