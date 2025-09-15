const gulp = require('gulp');
const hash = require('gulp-hash');
const minify = require('gulp-minify');
const references = require('gulp-hash-references');
const config = require('../config');

gulp.task('hash:css', function (cb) {
  return gulp
    .src(config.dest.css + '/*.css')
    .pipe(
      hash({
        hashLength: 6,
        template: '<%= name %><%= hash %><%= ext %>',
      })
    )
    .pipe(gulp.dest(config.dest.css))
    .pipe(
      hash.manifest(config.tmp.hashFor('manifest-css.json'), {
        deleteOld: true,
      })
    )
    .pipe(gulp.dest('.'));
});

gulp.task('update-references:css', function () {
  return gulp
    .src(config.dest.root + '/*.html')
    .pipe(references(config.tmp.hashFor('manifest-css.json'))) // Replace file paths in index.html according to the manifest
    .pipe(gulp.dest(config.dest.root));
});

gulp.task('hash:js', function (cb) {
  return gulp
    .src(config.dest.js + '/*.js')
    .pipe(
      minify({
        ext: {
          min: '.js',
        },
        noSource: true,
      })
    )
    .pipe(
      hash({
        hashLength: 6,
        template: '<%= name %><%= hash %><%= ext %>',
      })
    )
    .pipe(gulp.dest(config.dest.js))
    .pipe(
      hash.manifest(config.tmp.hashFor('manifest-js.json'), {
        deleteOld: true,
      })
    )
    .pipe(gulp.dest('.'));
});

gulp.task('update-references:js', function () {
  return gulp
    .src(config.dest.root + '/*.html')
    .pipe(references(config.tmp.hashFor('manifest-js.json'))) // Replace file paths in index.html according to the manifest
    .pipe(gulp.dest(config.dest.root));
});

gulp.task('hash', gulp.parallel('hash:css', 'hash:js'));

function build(cb) {
  if (config.env === 'production') {
    return gulp.series(
      'clean',
      gulp.parallel('sprite:svg', 'svgo'),
      gulp.parallel('sass', 'jsConf'),
      'nunjucks',
      'webpack',
      'copy',
      'hash',
      gulp.parallel('update-references:css', 'update-references:js')
    )(cb);
  } else {
    return gulp.series(
      'clean',
      gulp.parallel('sprite:svg', 'svgo'),
      gulp.parallel('sass', 'jsConf'),
      'nunjucks',
      'webpack',
      'copy'
    )(cb);
  }
}

gulp.task('build', function (cb) {
  config.setEnv('production');
  config.logEnv();
  build(cb);
});

gulp.task('build:dev', function (cb) {
  config.setEnv('development');
  config.logEnv();
  build(cb);
});
