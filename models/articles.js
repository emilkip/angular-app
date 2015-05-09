var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
	header: String,
	text: String,
	author: String,
	publishDate: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Article', articleSchema);