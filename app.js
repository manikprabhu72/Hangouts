var express = require('express');
var session = require('express-session');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:admin@ssdi.3okay.mongodb.net/hangouts?retryWrites=true&w=majority');

app.use(session({
    'secret': 'abcdefgh'
}));

var connectionRouter = require('./routes/connectionController.js');
var profileRouter = require('./routes/profileController');

app.use('/assets', express.static('assets'));
app.set('view engine', 'ejs');

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});
app.use('/connections',connectionRouter);
app.use('/profile', profileRouter);

//route for Home page
app.get('/', function(req,res){
    res.render('index');
});

//route for about page
app.get('/about', function(req,res){
    res.render('about');
});

//route for contact page
app.get('/contact', function(req,res){
    res.render('contact');
});

app.get('/*', function(req,res){
    res.render('404');
});

app.listen(8080);
console.log('Server Listening on port 8080');