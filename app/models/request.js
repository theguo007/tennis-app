/* Schema for users */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var requestSchema = new Schema({
	userId: String,								// requester's user id
	startTime: String,							// starting time (in seconds since 1970)
	endTime: String, 							// ending time (in seconds since 1970)
	lat: String, 								// location's lat number
	lng: String 								// location's lng number
});

module.exports = mongoose.model('Request', requestSchema);