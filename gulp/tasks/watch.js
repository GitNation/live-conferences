const gulp = require('gulp');

gulp.task('watch', function(cb) {
	return gulp.parallel('copy:watch', 'nunjucks:watch', 'sprite:svg:watch', 'svgo:watch', 'webpack:watch', 'sass:watch', 'jsConf:watch')(cb);
});
