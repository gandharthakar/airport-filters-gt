
const gulp  = require('gulp');
const sass = require('gulp-sass') (require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

// Function For Convesion Of SASS Into Plain CSS.
gulp.task('convert-css', async function() {
	gulp.src(['public/sass/**/*.scss'])
	.pipe(sass().on('error', sass.logError))
	.pipe(postcss([ autoprefixer() ]))
	.pipe(gulp.dest('public/css/'));
});

//Watch Task For Conversion Of SASS Into Plain CSS
gulp.task('watch', function() {
    gulp.watch('public/sass/**/*.scss', gulp.series('convert-css'));
});