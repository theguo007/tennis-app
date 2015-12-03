// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TennisRequest = require('./models/requests');
var TennisMessage = require('/models/message');
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

//API's for the request model
router.route('/requests')
	// create a request
	.post(function(request, response){
		var tennisRequest = new TennisRequest();
		tennisRequest.name = request.body.name;
		tennisRequest.description = request.body.description;
		tennisRequest.contacted = false;
		tennisRequest.contactMessage = null;
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
    })
    // Update information about the request
    .update(function(request, response){
    	TennisRequest.findById(request.params.request_id, function(err, tennisRequest){
    		if(err){
    			response.send(err);
    		} else {
    			tennisRequest.name = request.body.name;
				tennisRequest.description = request.body.description;
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
						response.json({message: "request saved successfully"});
					}
				});
    		}    		
    	});
    });
// Used when someone contacts a tennis request
router.route('/requests/:request_id/contact')
	.update(function(request,response){
		TennisRequest.findById(request.params.request_id, function(err, tennisRequest){
			if(err){
				response.send(err);
			} else {
				//create a new message
				var tennisMessage = new TennisMessage();
				tennisMessage.message = request.body.message;
				tennisMessage.phone = request.body.phone;
				tennisMessage.requestId = request.params.request_id;				
				tennisMessage.save(function(err, message){
					if (err) {
						response.sent(err);
					} else {
						//edit current tennisRequest
						tennisRequest.contacted = true;
						TennisRequest.findByIdAndUpdate(tennisRequest._id,{ $push: { messageIds: message._id }}, function(err){
							if (err) {
				                console.log(err);
					        } else {
				                console.log("Successfully added");
					        }
						});
						tennisRequest.messageIds = request.body.contactMessage;
						tennisRequest.save(function(err, tennisRequest){
							if (err) {
								response.sent(err);
							} else {
								//response returns the id for the message.
								response.json({message: "message saved successfully", id: tennisMessage.id})
							}
						});						
					}
				});			
			}
		});
	});

// routes for the message model
router.route('/messages/:message_id')
	//delete the message
	.delete(function(request, response) {
        TennisMessage.remove({
            _id: request.params.message_id
        }, function(err, tennisMessage) {
            if (err)
                response.send(err);

            response.json({ message: 'Successfully deleted' });
        });
    })
	// returns phone number Done by the person who posts the request. This should return the number of the messager
	.get(function(request, response) {
        TennisMessage.findById(request.params.message_id, function(err, tennisMessage) {
            if (err)
                response.send(err);
            response.json(tennisMessage);
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);