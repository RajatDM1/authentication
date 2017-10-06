var express = require('express'),
	app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var User 		= require('./models/user')
var passportLocalMongoose = require('passport-local-mongoose');

app.set('view engine','ejs');
mongoose.connect('mongodb://localhost/auth_demo');
app.use(require("express-session")({
	secret : "bla bla",
	resave : false,
	saveUninitialized : false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended:true}));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes

app.get('/',function(req,res){
	res.render('home');
});

app.get('/secret',isLoggedIn,function(req,res){
	res.render('secret');
});

//auth routes
//show signup form
app.get('/register',function(req,res){
	res.redirect('/login');
});

app.post('/register',function(req,res){
	User.register(new User({username: req.body.username}),req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req,res,function(){
			res.redirect('/secret');	
		});
	});
});

app.get('/login',function(req,res){
	res.render('login');
});

//middleware
app.post('/login',passport.authenticate('local',
	{successRedirect : "/secret",
	 failureRedirect :"/login"}),
	 function(req,res){

});

app.get('/logout',function(req,res){
	//res.send('logout');
	req.logout();
	res.redirect('/');
});

function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/login'); 
};

app.listen(3000,function(){
	console.log('Server started');
});