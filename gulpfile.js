
const gulp  = require('gulp');
const sass = require('gulp-sass') (require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');

// Function For Convesion Of SASS Into Plain CSS.
gulp.task('convert-css', async function() {
	gulp.src(['public/sass/**/*.scss'])
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(postcss([ autoprefixer() ]))
	.pipe(cleanCSS({compatibility: 'ie8'}))
	.pipe(concat("production.css"))
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest('public/production'));
});

//Watch Task For Conversion Of SASS Into Plain CSS
gulp.task('watch-css', function() {
    gulp.watch('public/sass/**/*.scss', gulp.series('convert-css'));
});

gulp.task("js", function () {
	return gulp.src("public/js/**/*.js")
	.pipe(sourcemaps.init())
	.pipe(babel())
	.pipe(concat("production.js"))
	.pipe(uglify())
	.pipe(sourcemaps.write("."))
	.pipe(gulp.dest("public/production"));
});

gulp.task('watch-js', function() {
    gulp.watch('public/js/**/*.js', gulp.series('js'));
});