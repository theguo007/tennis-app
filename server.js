// server.js

// BASE SETUP
// =============================================================================

var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passwordHash = require('password-hash');

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

// Create user
router.post('/user', function(req, res){
	if(req.body.username != null && req.body.password != null){
		User.findOne({username: req.body.username}, function(err, user){
			if(user == null){
				var user = new User();
				var description = req.body.description ? req.body.description : "";
				user.username = req.body.username;
				user.password = passwordHash.generate(req.body.password);
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

// return token if authentication was successful
router.post('/authenticate', function(req, res) {
	User.findOne({
		username: req.body.username
	}, function(err, user) {
	    if (err) throw err;
		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else {
			// check if password matches
			if (!passwordHash.verify(req.body.password, user.password)) {
				res.json({ success: false, message: 'Authentication failed. Wrong password.' });
			} else {
			    // if user is found and password is right
			    // create a token
			    var token = jwt.sign(user.id, app.get('superSecret'), {});

			    // return the information including token as JSON
			    res.json({
					success: true,
					token: token
			    });
			}   
		}
	});
});

// require token before function can be called
router.use(function(req, res, next){
	var token = req.headers['token'];
	if(token){
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			} else {
			// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				console.log(decoded);   
				next();
			}
		});
	} else {
		return res.status(403).send({ 
	        success: false, 
	        message: 'No token provided.' 
	    });
	}
});

// Testing Routes

// Get all users
router.get('/user', function(req, res){
	User.find({}, function(err, users) {
    	res.json(users);
  	});
});

// Clear database
router.delete('/all', function(req, res){
	User.remove({}, function(err) {
            if (err) response.send(err);
            response.json({ message: 'Successfully deleted everything' });
        });
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
