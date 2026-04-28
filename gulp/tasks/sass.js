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
		overrideBrowserslist: [
			'last 3 Chrome versions',
			'last 3 Firefox versions',
			'last 3 Safari versions',
			'last 3 Edge versions',
			'not dead',
			'not ie <= 11',
			'not op_mini all',
		],
		cascade: false,
		grid: false,
		remove: false,
	}),
	require('lost'),
	mqpacker({
		sort: sortMediaQueries,
	}),
	// csso
];

gulp.task('sass', function() {
	return gulp
		.src(config.src.sass + '/*.{sass,scss}')
		.pipe(sourcemaps.init())
		.pipe(
			sass({
				outputStyle: 'expanded',
				precision: 5,
				silenceDeprecations: ['import', 'legacy-js-api'],
			})
		)
		.on('error', config.errorHandler)
		.pipe(postcss(processors))
		.pipe(cleanCss())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(config.dest.css));
});

gulp.task('sass:watch', function() {
	gulp.watch(config.src.sass + '/**/*.{sass,scss}', gulp.series('sass'));
	gulp.watch([config.src.templates + '/**/*.sass'], gulp.series('sass'));
});

function isMax(mq) {
	return /max-width/.test(mq);
}

function isMin(mq) {
	return /min-width/.test(mq);
}

function sortMediaQueries(a, b) {
	A = a.replace(/\D/g, '');
	B = b.replace(/\D/g, '');

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
