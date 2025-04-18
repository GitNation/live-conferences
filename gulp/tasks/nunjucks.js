const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const changed = require('gulp-changed');
const wait = require('gulp-wait');
const prettify = require('gulp-prettify');
const frontMatter = require('gulp-front-matter');
const data = require('gulp-data');
const chalk = require('chalk');
const staticGoogleMap = require('static-google-map');

const config = require('../config');
const { getContent } = require('@focus-reactive/graphql-content-layer');
const conferenceSettings = require('../util/getSettings');

let cmsContent;

const fetchContent = async () => {
  const getAndLogContent = async () => {
    const content = await getContent(conferenceSettings);
    fs.writeFileSync(path.resolve(__dirname, '../../content-log.json'), JSON.stringify(content, null, 2));
    return content;
  };
  cmsContent = cmsContent || (await getAndLogContent());
  return cmsContent;
};

const readContent = () => {
  const dataRaw = fs.readFileSync(path.resolve(__dirname, '../../content-mock.json'), 'utf8');
  const data = JSON.parse(dataRaw);
  return data;
};

const contentLayer = () => {
  const arg = process.argv[3];
  const isMock = arg === '-m' || arg === '--mock';

  if (!isMock) return fetchContent;

  console.warn(chalk.yellow('\n*************************************************'));
  console.warn(chalk.yellow('*  Content will be taken from content-log.json  *'));
  console.warn(chalk.yellow('*************************************************\n'));

  return readContent;
};

function renderHtml(onlyChanged) {
  nunjucksRender.nunjucks.configure({
    watch: false,
    trimBlocks: true,
    lstripBlocks: false,
  });

  var manageEnvironment = function (environment) {
    environment.addGlobal('staticMapUrl', (params) => {
      return staticGoogleMap.staticMapUrl(eval(`(${params})`));
    });
  };

  return (
    gulp
      .src([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'])
      .pipe(
        plumber({
          errorHandler: config.errorHandler,
        })
      )
      .pipe(gulpif(onlyChanged, changed(config.dest.html)))
      .pipe(frontMatter({ property: 'data' }))
      // TODO: remove this delay if we manage to optimize number of requests each build generates.
      //  GraphCMS is limited to 25rps, we do 15 requests per each conf with 3 built in parallel
      .pipe(wait(Math.round(Math.random() * 10) * 1000))
      .pipe(data(contentLayer()))
      .pipe(
        nunjucksRender({
          PRODUCTION: config.production,
          manageEnv: manageEnvironment,
          path: [config.src.templates],
        })
      )
      .pipe(
        prettify({
          indent_size: 2,
          wrap_attributes: 'auto', // 'force'
          preserve_newlines: false,
          // unformatted: [],
          end_with_newline: true,
        })
      )
      .pipe(gulp.dest(config.dest.html))
  );
}

gulp.task('nunjucks', function () {
  return renderHtml();
});

gulp.task('nunjucks:changed', function () {
  return renderHtml(true);
});

gulp.task('nunjucks:watch', function () {
  gulp.watch([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'], ['nunjucks:changed']);

  gulp.watch([config.src.templates + '/**/_*.html', '!' + config.src.templates + '/removePages/**/*'], ['nunjucks']);

  gulp.watch(['content-log.json'], ['nunjucks']);
});
