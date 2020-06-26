const gulp = require('gulp');
const config = require('../../src/conferences/jsn/config');

gulp.task('watch', [
  'copy:watch',
  'nunjucks:watch',
  'sprite:svg:watch',
  'svgo:watch',
  'webpack:watch',
  'sass:watch',
]);
