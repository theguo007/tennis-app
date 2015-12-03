/* Schema for requests */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var requestSchema = new Schema({
	name: String, //name of player
	// skill: Number,
	// ismale: Boolean,
	// age: Number,
	description: String, 		//short description of skill level
	// righthanded: Boolean,
	// typeofplayer: Number,
	newMessage: Boolean, 		// Initially false, turns true when someone messages them but then turns false when the requester sees the message.
	messageIds: [Number],		// message sent by person contacting the request
	start: String, 				// start of time free
	stop: String, 				// the end of time free. also when to delete post
	lat: Number, 				// location latitude
	lng: Number 				// location longitude
});

module.exports = mongoose.model('Request', requestSchema);