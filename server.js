// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TennisRequest = require('./models/requests');
mongoose.connect('mongodb://localhost/tennis');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(request, response) {
    response.json({ message: 'hooray! welcome to our tennis request api!' });   
});

router.route('/requests')
	// create a request
	.post(function(request, response){
		var tennisRequest = new TennisRequest();
		tennisRequest.name = request.body.name;
		tennisRequest.description = request.body.description;
		tennisRequest.contacted = request.body.contacted;
		tennisRequest.start = request.body.start;
		tennisRequest.stop = request.body.stop;
		tennisRequest.lat = request.body.lat;
		tennisRequest.lng = request.body.lng;
		// tennisRequest.skill = request.body.skill;	
		// tennisRequest.isMale = request.body.isMale;
		// tennisRequest.age = request.body.age;
		// tennisRequest.rightHanded = request.body.rightHanded;
		// tennisRequest.typeOfPlayer = request.body.typeOfPlayer;
		tennisRequest.save(function(err, tennisRequest){
			if (err) {
				response.sent(err);
			} else {
				response.json({message: "request saved successfully", id: tennisRequest.id})
			}
		});
	})
	// get all tennis requests
	.get(function(req, res) {
        TennisRequest.find(function(err, tennisRequest) {
            if (err)
                res.send(err);

            res.json(tennisRequest);
        });
    });

router.route('/requests/:request_id')
	// get the request by id. Read info
    .get(function(request, response) {
        TennisRequest.findById(request.params.request_id, function(err, tennisRequest) {
            if (err)
                response.send(err);
            response.json(tennisRequest);
        });
    })
    // delete the request. no longer needed
    .delete(function(request, response) {
        TennisRequest.remove({
            _id: request.params.request_id
        }, function(err, tennisRequest) {
            if (err)
                response.send(err);

            response.json({ message: 'Successfully deleted' });
        });
    });

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);