const gulp = require('gulp');
const config = require('../config');

gulp.task('jsConf', function () {
  return gulp
    .src(config.src.jsConf + '/*.js')
    .on('error', config.errorHandler)
    .pipe(gulp.dest(config.dest.js));
});

gulp.task('jsConf:watch', function () {
  gulp.watch(config.src.jsConf + '/**/*.js', ['jsConf']);
  gulp.watch([config.src.templates + '/**/*.js'], ['jsConf:changed']);
});
