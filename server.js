// server.js

// BASE SETUP
// =============================================================================

var express      = require('express');
var app          = express();
var bodyParser   = require('body-parser');
var morgan       = require('morgan');
var mongoose     = require('mongoose');
var passwordHash = require('password-hash');
var jwt    = require('jsonwebtoken');

var config = require('./config');
var User   = require('./app/models/user');
var Request = require('./app/models/request')
var Verify = require('./app/controllers/verify');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;        // set our port
var router = express.Router();              // get an instance of the express Router
app.use(morgan('dev'));
mongoose.connect(config.database);          // connect to database
app.set('superSecret', config.secret);      // secret variable

// Routes

router.get('/', function(req, res) {
    res.send('Hello! World?');
});

// Create user
router.post('/user', function(req, res){
	if(req.body.username != null && req.body.password != null && req.body.contactInfo){
		User.findOne({username: req.body.username}, function(err, user){
			if(user == null){
				var user = new User();
				var description = req.body.description ? req.body.description : "";
				user.username = req.body.username;
				user.password = passwordHash.generate(req.body.password);
				user.description = description;
				user.contactInfo = req.body.contactInfo;
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
				req.userId = decoded;
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

// Get myself
router.get('/user', function(req, res){
	User.findById(req.userId, function(err, user) {
		if(err) res.send(err);
    	res.json(user);
  	});
});

// Edit user information (of self)
router.put('/user', function(req, res){
	User.findById(req.userId, function(err, user){
		if(err) res.send(err);
		if(req.body.name) user.name = req.body.name;
		if(req.body.description) user.description = req.body.description;
		if(req.body.contactInfo) user.contactInfo = req.body.contactInfo;
		user.save(function(err){
			if(err) res.send(err);
			res.json({success: true, message: "user updated"});
		})
	});
});

router.put('/password', function(req, res){
	User.findById(req.userId, function(err, user){
		if(!req.body.oldPass || !req.body.newPass || !req.body.confirmedPass){
			res.send({success: false, message: "One of the fields is missing"});
			return;
		} else if (!passwordHash.verify(req.body.oldPass, user.password)){
			res.send({success: false, message: "Old password is incorrect"});
			return;
		} else if (req.body.newPass != req.body.confirmedPass){
			res.send({success: false, message: "New password's do not match"});
			return;
		} else {
			user.password = passwordHash.generate(req.body.newPass);
			user.save(function(err){
				if(err) res.send(err);
				res.json({success: true, message: "password updated successfully"});
			})
		}
	});
});

// Create a request
router.post('/request', function(req, res){
	// Verify that the fields exist and are numbers. Have not fully verified lat/lng bc too lazy
	if(!req.body.startTime || 
		!req.body.endTime || 
		!req.body.lat || 
		!req.body.lng ||
		isNaN(req.body.startTime) ||
		isNaN(req.body.endTime) ||
		isNaN(req.body.lat) ||
		isNaN(req.body.lng)){
		res.send({success: false, message: "One of the fields is missing or is not a number"});
		return;
	}

	// Still need to verify that startTime is earlier than end time and that lat and lng are proper values
	
	if(Math.abs(Number(req.body.lat)) > 90 || Math.abs(Number(req.body.lng)) > 180){
		res.send({success: false, message: "invalid GPS coordinates"});
		return;
	} else if (Number(req.body.endTime) < Number(req.body.startTime)){
		res.send({success: false, message: "ending time cannot be before start time"});
		return;
	}

	var request = new Request();
	request.userId = req.userId;
	request.startTime = req.body.startTime;
	request.endTime = req.body.endTime;
	request.lat = req.body.lat;
	request.lng = req.body.lng;
	request.save(function(err, request) {
		if (err) throw err;
		User.findById(req.userId, function(err, user){
			user.requestIds.push(request.id);
			user.save(function(err){
				if (err) throw err;
				res.send({success: true, message: "successfully created request"});
			});
		});
	});
});

// Get all requests
router.get('/request', function(req, res){
	Request.find(function(err, requests){
		res.send(requests);
	});
});

// Edit request
router.put('/request/:id', function(req, res){
	Request.findById(req.params.id, function(err, request){
		if(!request){
			res.send({success: false, message: "requestId is invalid"});
			return;
		} else if(request.userId != req.userId){
			res.send({success: false, message: "user does not have permission to edit"});
			return;
		} else {
			if(req.body.startTime && !isNaN(req.body.startTime)){
				request.startTime = req.body.startTime;
			}
			if(req.body.endTime && !isNaN(req.body.endTime)){
				request.endTime = req.body.endTime;
			}
			if (Number(request.endTime) < Number(request.startTime)){
				res.send({success: false, message: "ending time cannot be before start time"});
				return;
			}
			if(req.body.lat){
				if(!isNaN(req.body.lat) && Math.abs(Number(req.body.lat)) <= 90){
					request.lat = req.body.lat;
				} else {
					res.send({success: false, message: "invalid coordinates"});
				}
			}
			if(req.body.lng){
				if(!isNaN(req.body.lng) && Math.abs(Number(req.body.lng)) <= 90){
					request.lng = req.body.lng;
				} else {
					res.send({success: false, message: "invalid coordinates"});
				}
			}
			request.save(function(err){
				if(err) throw err;
				res.send({success: true, message: "successfully edited request"});
			});
		}
	});
});

// Delete request
router.delete('/request/:id', function(req, res){
	Request.findById(req.params.id, function(err, request){
		if(!request){
			res.send({success: false, message: "requestId is invalid"});
			return;
		} else if(request.userId != req.userId){
			res.send({success: false, message: "user does not have permission to edit"});
			return;
		} else {
			Request.remove({
				_id: req.params.id
			}, function(err){
				if(err) throw err;
				res.send({success: true, message: "successfully deleted request"});
			})
		}
	});
});

// Testing Routes

// Clear database
router.delete('/all', function(req, res){
	User.remove({}, function(err) {
        if (err) response.send(err);
        response.json({ message: 'Successfully deleted everything' });
    });
});

// Get request by id. So far unnecessary
router.get('/request/:id', function(req, res){
	Request.findById(req.params.id, function(err, request){
		res.send(request);
	});
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);