const gulp = require('gulp');
const config = require('../config');

gulp.task('watch', function(cb) {
  return gulp.parallel('copy:watch', 'nunjucks:watch', 'sprite:svg:watch', 'svgo:watch', 'webpack:watch', 'sass:watch', 'jsConf:watch')(cb);
});
