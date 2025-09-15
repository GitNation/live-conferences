const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const config = require('../config');
const csso = require('postcss-csso');
const cleanCss = require('gulp-clean-css');

const processors = [
	autoprefixer({
		browsers: ['last 3 versions', 'ie >= 11'],
		cascade: false,
		grid: true,
	}),
	require('lost'),
	mqpacker({
		sort: sortMediaQueries,
	}),
	// csso
];

gulp.task('sass', function () {
	return gulp
		.src(config.src.sass + '/*.{sass,scss}')
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: config.production ? 'compressed' : 'expanded', // only 'expanded' and 'compressed' are supported in Dart Sass
				precision: 5,
				quietDeps: true, // Suppress deprecation warnings from dependencies
				silenceDeprecations: ['import', 'legacy-js-api'], // Suppress @import and legacy JS API deprecation warnings
				api: 'modern', // Use modern Sass API
			})
		)
		.on('error', config.errorHandler)
		.pipe(postcss(processors))
		.pipe(cleanCss())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.dest.css));
});

gulp.task('sass:watch', function () {
	gulp.watch(config.src.sass + '/**/*.{sass,scss}', gulp.task('sass'));
	gulp.watch([config.src.templates + '/**/[^_]*.sass'], gulp.task('sass'));
	gulp.watch(['src/partials/sass/**/*.{sass,scss}'], gulp.task('sass'));
});

function isMax(mq) {
	return /max-width/.test(mq);
}

function isMin(mq) {
	return /min-width/.test(mq);
}

function sortMediaQueries(a, b) {
	const A = a.replace(/\D/g, '');
	const B = b.replace(/\D/g, '');

	if (isMax(a) && isMax(b)) {
		return B - A;
	} else if (isMin(a) && isMin(b)) {
		return A - B;
	} else if (isMax(a) && isMin(b)) {
		return 1;
	} else if (isMin(a) && isMax(b)) {
		return -1;
	}

	return 1;
}
