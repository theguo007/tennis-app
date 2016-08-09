/* Schema for users */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	userId: String,
	requestId: String,
	recipientId: String,
	message: String
});

module.exports = mongoose.model('Message', messageSchema);