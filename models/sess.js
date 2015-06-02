var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sess = new Schema({
	_id: String,
	session: {
		cookie: {
			type: String,
			originalMaxAge: Number,
			expires: Number,
			httpOnly: Boolean,
			path: String
		},
		passport: {
			type: String,
			user: String
		}
	},
	expires: Date
});

module.exports = mongoose.model('Sessions', sess);