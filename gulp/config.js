const util = require('gulp-util');

const production = util.env.production || util.env.prod || false;

const folderName = process.env.CONF_CODE;
const destPath = `build/${folderName}`;
const srcPath = `src/conferences/${folderName}`;
const tempPath = `temp/${folderName}`;

const src = (path) => `${srcPath}/${path}`;
const dst = (path) => `${destPath}/${path}`;
const tmp = (path) => (fname) => `${tempPath}/${path}/${fname}`;

const config = {
  env: 'development',
  production: production,

  src: {
    root: 'src',
    confRoot: srcPath,
    templates: src('templates'),
    templatesData: src('templates/data'),
    pagelist: src('index.yaml'),
    sass: src('sass'),
    // path for sass files that will be generated automatically via some of tasks
    sassGen: src('sass/generated'),
    js: 'src',
    jsConf: src('js'),
    img: src('img'),
    pic: src('pic'),
    svg: src('img/svg'),
    icons: src('icons'),
    video: src('video'),
    // path to png sources for sprite:png task
    iconsPng: src('icons'),
    // path to svg sources for sprite:svg task
    iconsSvg: src('icons'),
    // path to svg sources for iconfont task
    iconsFont: src('icons'),
    fonts: src('fonts'),
    lib: src('lib'),
    data: src('data'),
  },
  dest: {
    root: destPath,
    html: destPath,
    css: dst('css'),
    js: dst('js'),
    img: dst('img'),
    pic: dst('pic'),
    video: dst('video'),
    fonts: dst('fonts'),
    lib: dst('lib'),
    data: dst('data'),
  },
  tmp: {
    hashFor: tmp('hash'),
  },

  setEnv: function (env) {
    if (typeof env !== 'string') return;
    this.env = env;
    this.production = env === 'production';
    process.env.NODE_ENV = env;
  },

  logEnv: function () {
    util.log('Environment:', util.colors.white.bgRed(' ' + process.env.NODE_ENV + ' '));
  },

  errorHandler: require('./util/handle-errors'),
};

config.setEnv(production ? 'production' : 'development');

module.exports = config;
