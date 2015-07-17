var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mailboxSchema = new Schema({
	from: String,
	to: String,
	topic: String,
	text: String,
	date: String,
	wasRead: {
		type: Boolean,
		default: false
	},
	showFrom: {
		type: Boolean,
		default: true
	},
	showTo: {
		type: Boolean,
		default: true
	}
});

module.exports = mongoose.model('Mailbox', mailboxSchema);