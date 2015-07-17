var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleLike = new Schema({
	articleId: String,
	userId: String
});

module.exports = mongoose.model('Like', articleLike);