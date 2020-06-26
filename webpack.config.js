const webpack = require('webpack');
const path = require('path');
const config = require('./gulp/config');

function createConfig(env) {
  let isProduction, webpackConfig;

  if (env === undefined) {
    env = process.env.NODE_ENV;
  }

  isProduction = env === 'production';

  webpackConfig = {
    mode: isProduction ? 'production' : 'development',
    // context: path.join(__dirname, config.src.js),
    entry: {
      // vendor: ['jquery'],
      app: './src/app.js',
    },
    output: {
      path: path.join(__dirname, config.dest.js),
      filename: '[name].js',
      publicPath: 'js/',
    },
    devtool: isProduction ? '#source-map' : '#cheap-module-eval-source-map',
    plugins: [
      // new webpack.optimize.CommonsChunkPlugin({
      //     name: 'vendor',
      //     filename: '[name].js',
      //     minChunks: Infinity
      // }),
      new webpack.LoaderOptionsPlugin({
        options: {
          eslint: {
            formatter: require('eslint-formatter-pretty'),
          },
        },
      }),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
      new webpack.NoEmitOnErrorsPlugin(),
    ],
    resolve: {
      extensions: ['.js'],
      alias: {
        TweenLite: path.resolve(
          'node_modules',
          'gsap/src/uncompressed/TweenLite.js'
        ),
        TweenMax: path.resolve(
          'node_modules',
          'gsap/src/uncompressed/TweenMax.js'
        ),
        TimelineLite: path.resolve(
          'node_modules',
          'gsap/src/uncompressed/TimelineLite.js'
        ),
        TimelineMax: path.resolve(
          'node_modules',
          'gsap/src/uncompressed/TimelineMax.js'
        ),
        ScrollMagic: path.resolve(
          'node_modules',
          'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'
        ),
        'animation.gsap': path.resolve(
          'node_modules',
          'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'
        ),
        'debug.addIndicators': path.resolve(
          'node_modules',
          'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'
        ),
      },
    },
    optimization: {
      minimize: isProduction,
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js[x]?$/,
          exclude: [/node_modules/, /react-app/],
          loader: 'eslint-loader',
          options: {
            fix: true,
            cache: true,
            configFile: path.resolve(__dirname, '.eslintrc.js'),
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.js[x]?$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
          exclude: [path.resolve(__dirname, 'node_modules')],
        },
        {
          test: /\.glsl$/,
          loader: 'webpack-glsl-loader',
        },
      ],
    },
  };

  if (isProduction) {
    webpackConfig.plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      })
    );
  }

  return webpackConfig;
}

module.exports = createConfig();
module.exports.createConfig = createConfig;
