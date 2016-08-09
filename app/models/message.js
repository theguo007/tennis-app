/* Schema for users */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	userId: String,
	requestId: String
});

module.exports = mongoose.model('Message', messageSchema);