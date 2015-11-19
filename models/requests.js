var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var requestSchema = new Schema({
	name: String,
	// skill: Number,
	// ismale: Boolean,
	// age: Number,
	description: String,
	// righthanded: Boolean,
	// typeofplayer: Number,
	contacted: Boolean,
	start: String,
	stop: String,
	lat: Number, //must validate both lat and lng
	lng: Number
});

module.exports = mongoose.model('Request', requestSchema);