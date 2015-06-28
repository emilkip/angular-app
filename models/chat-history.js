var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// ch - chat history

var chSchema = new Schema({
	author: String,
	message: String,
	msgTime: String,
	day: Number,
	authorAvatar: String
});

module.exports = mongoose.model('ChatHistory', chSchema);