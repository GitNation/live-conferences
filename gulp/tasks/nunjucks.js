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
const filter = require('gulp-filter');

const config = require('../config');
const { getContent } = require('@focus-reactive/graphql-content-layer');
const conferenceSettings = require('../util/getSettings');

let cmsContent;

const pageMappings = {
  main: 'index',
  preEvent: 'pre-event',
  workshops_alt: 'remote-workshops',
  schedule: 'schedule-offline',
  advice_lounge: 'advice-lounge',
};

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

  const pageFilter = filter((file) => {
    const fileName = path.basename(file.path, '.html');
    const match = Object.entries(pageMappings).find(([, mappedName]) => mappedName === fileName);
    const mappedKey = match ? match[0] : undefined;

    const validPageKeys = (file.data && file.data.__validPageKeys) || [];
    const validPageKeysSet = new Set(validPageKeys);

    if (mappedKey) {
      if (validPageKeysSet.has(mappedKey)) {
        return true;
      } else {
        console.log(chalk.red(`Page ${fileName}.html with mappedKey '${mappedKey}' not found in content. Skipping.`));
        return false;
      }
    }

    if (validPageKeysSet.has(fileName)) {
      return true;
    }

    console.log(chalk.red(`Page ${fileName}.html does not match any key in content. Skipping.`));
    return false;
  });

  return gulp
    .src([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'])
    .pipe(
      plumber({
        errorHandler: config.errorHandler,
      })
    )
    .pipe(gulpif(onlyChanged, changed(config.dest.html)))
    .pipe(frontMatter({ property: 'data' }))
    .pipe(wait(Math.round(Math.random() * 10) * 1000))
    .pipe(
      data(async () => {
        const content = await contentLayer()();
        const validPageKeys = content.pages ? Object.keys(content.pages) : [];
        return { ...content, __validPageKeys: validPageKeys };
      })
    )
    .pipe(pageFilter)
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
        wrap_attributes: 'auto',
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(gulp.dest(config.dest.html));
}

gulp.task('nunjucks', function () {
  return renderHtml();
});

gulp.task('nunjucks:changed', function () {
  return renderHtml(true);
});

gulp.task('nunjucks:watch', function () {
  gulp.watch([config.src.templates + '/**/[^_]*.html', '!' + config.src.templates + '/removePages/**/*'], gulp.task('nunjucks:changed'));
  gulp.watch([config.src.templates + '/**/_*.html', '!' + config.src.templates + '/removePages/**/*'], gulp.task('nunjucks'));
  gulp.watch(['content-log.json'], gulp.task('nunjucks'));
});
