var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocal = require('passport-local-mongoose');


var userSchema = new Schema({
	username: {
		type: String,
		unique: true
	},
	password: String,
	email: {
		type: String,
		unique: true
	},
	avatar: String,
	isAdmin: {
		type: Boolean,
		default: false
	}
});

userSchema.plugin(passportLocal);

module.exports = mongoose.model('Users', userSchema);