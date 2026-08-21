const gulp = require('gulp');
const config = require('../config');

// main.js is a webpack entry, not a plain file — it must not be copied over the bundle
gulp.task('jsConf', function() {
	return gulp
		.src([config.src.jsConf + '/*.js', '!' + config.src.jsConf + '/main.js'])
		.on('error', config.errorHandler)
		.pipe(gulp.dest(config.dest.js));
});

gulp.task('jsConf:watch', function() {
	gulp.watch(config.src.jsConf + '/**/*.js', gulp.series('jsConf'));
	gulp.watch([config.src.templates + '/**/*.js'], gulp.series('jsConf'));
});
