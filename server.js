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
	var user = new User();
	if(Verify.user(req.body.username, req.body.password, res)){
		return;
	} else {
		return;
	}
});

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
