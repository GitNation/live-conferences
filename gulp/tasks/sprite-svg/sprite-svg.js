var gulp = require('gulp');
var plumber = require('gulp-plumber');
var svgmin = require('gulp-svgmin');
var svgStore = require('gulp-svgstore');
var rename = require('gulp-rename');
var cheerio = require('gulp-cheerio');
var through2 = require('through2');
var consolidate = require('gulp-consolidate');
var config = require('../../config');

gulp.task('sprite:svg', function () {
  return gulp
    .src(config.src.iconsSvg + '/*.svg')
    .pipe(
      plumber({
        errorHandler: config.errorHandler,
      })
    )
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
        plugins: [
          {
            removeDesc: true,
          },
          {
            cleanupIDs: true,
          },
          {
            mergePaths: false,
          },
        ],
      })
    )
    .pipe(rename({ prefix: 'icon-' }))
    .pipe(svgStore({ inlineSvg: false }))

    .pipe(
      cheerio({
        run: function ($, file) {
          $('[fill]:not([fill="currentColor"])').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
          $('[class]').removeAttr('class');
          $('[flood-color]').removeAttr('flood-color');
        },
        parserOptions: { xmlMode: true },
      })
    )

    .pipe(rename({ basename: 'sprite' }))
    .pipe(gulp.dest(config.src.img));
});

gulp.task('sprite:svg:watch', function () {
  gulp.watch(config.src.iconsSvg + '/*.svg', gulp.task('sprite:svg'));
});
