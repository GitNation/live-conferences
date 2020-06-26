const gulp = require('gulp');
const ftp = require('vinyl-ftp');
const minimist = require('minimist');
const gutil = require('gulp-util');
const args = minimist(process.argv.slice(2));

gulp.task('deploy', function() {
  const remotePath = '/';
  const conn = ftp.create({
    host: 'buff.elastictech.org',
    user: args.user,
    password: args.password,
    log: gutil.log,
    parallel: 10,
  });

  // Always deploy HTML
  gulp.src([
    './build/*.*'
  ])
    .pipe(conn.dest(remotePath));

  // Always deploy CSS
  gulp.src([
    './build/css/**/*.*'
  ])
    .pipe(conn.dest('/css'));

  // Always deploy JS
  gulp.src([
    './build/js/**/*.*'
  ])
    .pipe(conn.dest('/js'));

  // Compare size of other files before deploy
  gulp.src([
    './build/**/*.*',
    '!./build/*.*',
    '!./build/css/**/*.*',
    '!./build/js/**/*.*'
  ])
    .pipe(conn.differentSize(remotePath))
    .pipe(conn.dest(remotePath));

  // uncomment to deploy last year versions
  // gulp.src([
  //   './2018/**/*.*'
  // ])
  //   .pipe(conn.dest(`${remotePath}/2018`));
  //
  // gulp.src([
  //   './2017/**/*.*'
  // ])
  //   .pipe(conn.dest(`${remotePath}/2017`));
});
