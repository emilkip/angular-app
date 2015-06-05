var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var onlineUsersSchema = new Schema({
	username: String
});

module.exports = mongoose.model('OnlineUsers', onlineUsersSchema);