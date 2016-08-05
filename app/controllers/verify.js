var User = require('../models/user');

module.exports = {
	user: function(user, pass, res) {
		if(user == null || pass == null){
			res.send({success: false, message: "user or pass is missing"});
			return false;
		}
		User.findOne({username: user}, function(err, person){
			if(person){
				res.send({success: false, message: "username already taken"});
				return false;
			}
			res.send({succes: true, message: "what?? it works???"});
			return true;
		});
	}
};