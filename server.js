// server.js

// BASE SETUP
// =============================================================================

var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var Verify = require('./app/controllers/verify');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;        // set our port
var router = express.Router();              // get an instance of the express Router
app.use(morgan('dev'));
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// Routes

router.get('/', function(req, res) {
    res.send('Hello! World?');
});

router.post('/user', function(req, res){
	if(req.body.username != null && req.body.password != null){
		User.findOne({username: req.body.username}, function(err, user){
			if(user == null){
				var user = new User();
				var description = req.body.description ? req.body.description : "";
				user.username = req.body.username;
				user.password = req.body.password;
				user.description = description;
				user.save(function(err, user) {
					if (err) throw err;
					res.json({ success: true, message: user });
				});
			} else {
				res.json({success: false, message: "username already taken"});
			}
		});
	} else {
		res.json({success: false, message: "user or pass not included"});
	}
});

// Testing Routes

router.get('/user', function(req, res){
	User.find({}, function(err, users) {
    	res.json(users);
  	});
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
