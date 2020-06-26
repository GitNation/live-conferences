var gulp           = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var plumber        = require('gulp-plumber');
var gulpif         = require('gulp-if');
var changed        = require('gulp-changed');
var prettify       = require('gulp-prettify');
var frontMatter    = require('gulp-front-matter');
var config         = require('../config');
var data           = require('gulp-data');
const { getContent } = require('@focus-reactive/graphql-content-layer');
// var { getContent } = require('../../content');
const conferenceSettings = require('../conference-settings');
const fs = require('fs');
const path = require('path');

let cmsContent;

const fetchContent = async () => {
  const getAndLogContent = async () => {
    const content = await getContent(conferenceSettings);
    fs.writeFileSync(path.resolve(__dirname, '../../content-log.json'), JSON.stringify(content, null, 2));
    return content;
  };
  cmsContent = cmsContent || await getAndLogContent();
  return cmsContent;
}

function renderHtml(onlyChanged) {
    nunjucksRender.nunjucks.configure({
        watch: false,
        trimBlocks: true,
        lstripBlocks: false
    });

    return gulp
        .src([config.src.templates + '/**/[^_]*.html'])
        .pipe(plumber({
            errorHandler: config.errorHandler
        }))
        .pipe(gulpif(onlyChanged, changed(config.dest.html)))
        .pipe(frontMatter({ property: 'data' }))
        .pipe(data(() => fetchContent()))
        .pipe(nunjucksRender({
            PRODUCTION: config.production,
            path: [config.src.templates]
        }))
        .pipe(prettify({
            indent_size: 2,
            wrap_attributes: 'auto', // 'force'
            preserve_newlines: false,
            // unformatted: [],
            end_with_newline: true
        }))
        .pipe(gulp.dest(config.dest.html));
}

gulp.task('nunjucks', function() {
    return renderHtml();
});

gulp.task('nunjucks:changed', function() {
    return renderHtml(true);
});

gulp.task('nunjucks:watch', function() {
    gulp.watch([
        config.src.templates + '/**/[^_]*.html'
    ], ['nunjucks:changed']);

    gulp.watch([
        config.src.templates + '/**/_*.html'
    ], ['nunjucks']);

    gulp.watch([
        config.src.templates + '/**/*.njk'
    ], ['nunjucks']);
});
