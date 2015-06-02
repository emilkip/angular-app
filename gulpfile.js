var gulp = require('gulp'),
	less = require('gulp-less'),
	uglify = require('gulp-uglify'),
	concat = require('gulp-concat'),
	minifyCss = require('gulp-minify-css');


gulp.task('less', function() {
	return gulp.src('public/stylesheets/less/*.less')
		.pipe(less())
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('concat', function() {
	return gulp.src('public/javascripts/*.js')
		.pipe(concat('app.js'))
		.pipe(gulp.dest('public/javascripts/concat'));
});

gulp.task('uglify', function() {
	return gulp.src('public/javascripts/concat/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('public/javascripts/concat'));
});

gulp.task('minifyCss', function() {
	return gulp.src('public/stylesheets/style.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('watch', function() {
	gulp.watch('public/javascripts/*.js', ['concat']);
	//gulp.watch('public/javascripts/concat/*.js', ['uglify']);
	gulp.watch('public/stylesheets/less/*.less', ['less']);
	gulp.watch('public/stylesheets/*.css', ['minifyCss']);
});


gulp.task('default', ['concat','less','minifyCss','watch']);