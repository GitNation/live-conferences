const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const ESLintPlugin = require('eslint-webpack-plugin');
const config = require('./gulp/config');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Optional per-conference entry: src/conferences/$CONF_CODE/js/main.js.
// Bundled only when that file exists, so it stays opt-in per conference.
// Inside it, import shared components the same way src/app.js does.
function confEntry() {
	const root = path.join(__dirname, config.src.js);
	const mainPath = path.join(__dirname, config.src.jsConf, 'main.js');

	if (!fs.existsSync(mainPath)) return {};

	return { main: './' + path.relative(root, mainPath) };
}

function createConfig(env) {
	if (env === undefined) {
		env = process.env.NODE_ENV;
	}

	const isProduction = env === 'production';

	return {
		mode: isProduction ? 'production' : 'development',
		context: path.join(__dirname, config.src.js),
		entry: {
			app: './app.js',
			...confEntry(),
		},
		output: {
			path: path.join(__dirname, config.dest.js),
			filename: '[name].js',
			publicPath: 'js/',
		},
		devtool: isProduction ? false : 'cheap-module-source-map',
		plugins: [
			new webpack.EnvironmentPlugin(['CONF_CODE']),
			new webpack.ProvidePlugin({
				$: 'jquery',
				jQuery: 'jquery',
				'window.jQuery': 'jquery',
			}),
			new ESLintPlugin({
				fix: true,
				cache: true,
				overrideConfigFile: path.resolve(__dirname, '.eslintrc.js'),
				formatter: require('eslint-formatter-pretty'),
				emitWarning: true,
				failOnError: false,
			}),
			...(isProduction
				? []
				: [
						new BundleAnalyzerPlugin({
							analyzerMode: 'static',
							analyzerPort: 4000,
							openAnalyzer: false,
						}),
					]),
		],
		resolve: {
			extensions: ['.js'],
			alias: {
				TweenLite: path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
				TweenMax: path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
				TimelineLite: path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
				TimelineMax: path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
				ScrollMagic: path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
				'animation.gsap': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
				'debug.addIndicators': path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js'),
			},
		},
		optimization: {
			minimize: isProduction,
		},
		module: {
			rules: [
				{
					test: /\.css$/i,
					use: ['style-loader', 'css-loader'],
				},
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: [path.resolve(__dirname, 'node_modules')],
				},
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: [/node_modules\/(?!(swiper|dom7)\/).*/, /\.test\.jsx?$/],
				},
			],
		},
	};
}

module.exports = createConfig();
module.exports.createConfig = createConfig;
