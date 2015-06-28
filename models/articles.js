var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
	header: String,
	text: String,
	author: String,
	authorAvatar: String,
	publishDate: String,
	image: String
});

module.exports = mongoose.model('Article', articleSchema);