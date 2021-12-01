/**
 * Web Atelier 2021  Final Project : DoX
 *
 * Main Server Aplication
 * 
 */


// require framework and middleware dependencies
const express = require('express');
const path = require('path');
const logger = require('morgan');
const methodOverride = require('method-override');


// Passport and Express-Session library
const passport = require('passport');
const session = require('express-session');
// passport strategies for authentication
const passportStrategies = require('./modules/passportStrategies.js');


//Import the secondary "Strategy" library
const LocalStrategy = require('passport-local').Strategy;

// Custom middleware authentication and flash message view middleware 
const userInViews = require('./modules/auth_middleware/UserInviews.js')
const flashMessageInViews = require('./modules/auth_middleware/flashMessageInviews.js')
var flash = require('connect-flash');



/////////////////////////////////////////////////////////////////////////////////////
// INIT framework
const app = express();

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(express.json());    // parse application/json
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');


// INIT session
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
}));

// INIT passport on every route call.
app.use(passport.initialize());
// allow passport to use "express-session".
app.use(passport.session());

// log-in
passport.use('local-login', new LocalStrategy(passportStrategies.authUser))

// register
passport.use('local-signup', 
    new LocalStrategy(
        {passReqToCallback: true}, // we pass the re to the callback to be able to read the email (req.body.email)
        passportStrategies.registerUser)
);

// attach the {authenticate_user} to req.session.passport.user.{authenticated_user}
passport.serializeUser( (userObj, done) => {
    done(null, userObj)
})
// get the {authenticated_user} for the session from "req.session.passport.user.{authenticated_user}, and attach it to req.user.{authenticated_user}
passport.deserializeUser((userObj, done) => {
    done (null, userObj )
})

// flash messages
app.use(flash());
// Custom middleware authentication and flash message view middleware
app.use(userInViews)
app.use(flashMessageInViews)




/////////////////////////////////////////////////////////////////////////////////////
// CONTROLLERS
//this will automatically load all routers found in the routes folder
const routers = require('./routes');

app.use('/', routers.root);


//default fallback handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (app.get('env') === 'development') {
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});
//}





/////////////////////////////////////////////////////////////////////////////////////
// Start server
app.set('port', process.env.PORT || 8888);

var server = require('http').createServer(app);


server.on('listening', function() {
	console.log('Express server listening on port ' + server.address().port);
});

server.listen(app.get('port'));