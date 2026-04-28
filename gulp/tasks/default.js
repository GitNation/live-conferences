const gulp = require('gulp');

gulp.task('default', function(cb) {
	return gulp.series('build:dev', gulp.parallel('watch', 'server'))(cb);
});
