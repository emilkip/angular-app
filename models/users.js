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
	},
	birthday: {
		type: String,
		default: 'Unknown'
	},
	regDate: String,
	country: {
		type: String,
		default: 'Unknown'
	},
	site: {
		type: String,
		default: 'Unknown'
	},
	status: String
});

userSchema.plugin(passportLocal);

module.exports = mongoose.model('Users', userSchema);