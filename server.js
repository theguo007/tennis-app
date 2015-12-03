// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TennisRequest = require('./models/requests');
var TennisMessage = require('./models/messages');
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
		tennisRequest.newMessage = false;
		tennisRequest.messageIds = [];
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
	.get(function(request, response) {
        TennisRequest.find(function(err, tennisRequest) {
            if (err)
                response.send(err);
            response.json(tennisRequest);
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
    // delete the request. Also make sure to delete all messages.
    .delete(function(request, response) {
    	TennisRequest.findById(request.params.request_id, function(err, tennisRequest) {
            if (err)
                response.send(err);
            console.log(tennisRequest.messageIds.length);
            for(i = 0; i < tennisRequest.messageIds.length; i++){
	    		TennisMessage.remove({
		            _id: tennisRequest.messageIds[i]
		        }, function(err, tennisMessage) {
		            if (err)
		                response.send(err);
		        });
	    	}
        });		    
        TennisRequest.remove({
            _id: request.params.request_id
        }, function(err, tennisRequest) {
            if (err)
                response.send(err);
            response.json({ message: 'Successfully deleted' });
        });
    })
    // Update information about the request
    .put(function(request, response){
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
router.route('/messages')
	.post(function(request,response){
		TennisRequest.findById(request.body.requestId, function(err, tennisRequest){
			if(err){
				response.send(err);
			} else {
				//create a new message
				var tennisMessage = new TennisMessage();
				tennisMessage.message = request.body.message;
				tennisMessage.phone = request.body.phone;
				tennisMessage.requestId = request.body.requestId;				
				tennisMessage.save(function(err, message){
					if (err) {
						response.sent(err);
					} else {
						//edit current tennisRequest
						tennisRequest.newMessage = true;
						TennisRequest.findByIdAndUpdate(tennisRequest._id, { $push: { messageIds: tennisMessage._id }}, function(err){
							if (err) {
				                console.log(err);
					        } else {
				                console.log("Successfully added");
					        }
						});
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
		})
	})
	.get(function(request, response){
		TennisMessage.find({ requestId: request.body.requestId }, function(err, tennisMessage) {
            if (err)
                response.send(err);
            if (tennisMessage != null){
            	TennisRequest.findById(tennisMessage.requestId, function(err, tennisRequest) {
		            tennisRequest.newMessage = false;	           
		            tennisRequest.save(function(err, tennisRequest){
		            	if (err) {
							response.sent(err);
						}
		        	});
	        	});
            }      
            response.json(tennisMessage);
        });
	});

// routes for the message model
router.route('/messages/:message_id')
	// returns the message to the tennis requester. "Falsifies" the newMessage part in tennis request
	.get(function(request, response) {
        TennisMessage.findById(request.params.message_id, function(err, tennisMessage) {
            if (err)
                response.send(err);
            //Update the tennis request          
        	// response for the message
            response.json(tennisMessage);
        });
    // })
  //   .delete(function(request, response) {
		// TennisMessage.remove({
  //           _id: request.params.message_id
  //       }, function(err, tennisMessage) {
  //           if (err)
  //               response.send(err);
  //           response.json({ message: 'Successfully deleted' });
  //       });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

/*
	Make sure to update newMessage correctly. Don't want to see any message and it gets rid
	of newMessage thing. 
*/