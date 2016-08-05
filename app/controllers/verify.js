var User = require('../models/user');

module.exports = {
	user: function(user, pass, res) {
		var success;
		if(user == null || pass == null){
			res.send({success: false, message: "user or pass is missing"});
			return false;
		}
		return true;
	}
};