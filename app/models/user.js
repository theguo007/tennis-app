/* Schema for users */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	username: String,							// unique username
	password: String,							// hashed password
	name: String, 								// name of player
	description: String, 						// short description of skill level
});

module.exports = mongoose.model('User', userSchema);