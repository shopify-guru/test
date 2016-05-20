
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , favicon = require('serve-favicon')
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
//  , session = require('express-session')
  , bodyParser = require('body-parser')
  , multer = require('multer')
  , methodOverride = require('method-override')
  , passport = require('passport')
  , config = require('./config')
  , database = require('./config/database');
  
var app = express();
require('./config/passport').initialize(passport);

// all environments
app.set('port', config.port || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(favicon('./public/favicon-32.png'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({dest: './uploads'}));
app.use(methodOverride());
app.use(cookieParser());
//app.use(session({ secret: "ilovewyfi", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
	res.set('X-Powered-By', 'WYFI');
	next();
});

// Routes
app.get('/', routes.index);

var router = express.Router();
routes.setupAPI(router);
app.use('/api/v1', router);

router = express.Router();
routes.setupImage(router);
app.use('/image', router);

router = express.Router();
routes.setupOthers(router);
app.use('/', router);

//Catch 404 and forwarding to error handler
app.use(function(req, res, next) {
	var err = new Error('API Not Found');
	err.status = 404;
	next(err);
});

//Error handlers
app.use(function(err, req, res, next) {
	if (!err) return next();
	if (err.wyfi) {
		res.json({success:false, error: err.error, message: err.message, showToUser: err.showToUser});
		return;
	}
	else {
		if (req.user) {
			console.error(new Date() + " : " + req.user.id + " : " + req.method + " : " + req.originalUrl + " ERROR : " + err);
		}
		else {
			console.error(new Date() + " : " + req.method + " " + req.originalUrl + " ERROR : " + err);
		}
		res.json({success:false, message:("" + err) || 'Something went wrong. Please try again later.'});
	}
});

// Load administrators
require('./app/controllers/userController').loadAdmins();

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));
