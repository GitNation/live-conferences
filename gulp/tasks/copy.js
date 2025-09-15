const gulp = require('gulp');
const config = require('../config.js');

gulp.task('copy', function () {
  return gulp
    .src([config.src.confRoot + '/*.*', config.src.confRoot + '/!(icons|sass|templates|removePages)/**/*.*', config.src.confRoot + '/_*'])
    .pipe(gulp.dest(config.dest.root));
});

gulp.task('copy:watch', function () {
  gulp.watch(config.src.img + '/*', gulp.task('copy'));
});
