var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var requestSchema = new Schema({
	name: String,
	skill: Number
	isMale: boolean,
	age: Number,
	description: String,
	rightHanded: boolean,
	typeOfPlayer: Number,
	contacted: boolean,
	// lat: String, //must validate both lat and lng
	// lng: String
});

module.exports = mongoose.model('Request', requestSchema);