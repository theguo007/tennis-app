/* Schema for messages */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	message: String,		//string of message
	requestId: ObjectId,	//id of the request that this message is attached too
	phone: Number			//whether the contact message has been accepted by the creator of the request
});

module.exports = mongoose.model('Message', messageSchema);
