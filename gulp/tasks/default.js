const gulp = require('gulp');

// Define a simple watch task reference that will be set up after all other tasks load
gulp.task('default', function(cb) {
  // This function approach ensures all other tasks are loaded first
  return gulp.series('build:dev', gulp.parallel('watch', 'server'))(cb);
});
