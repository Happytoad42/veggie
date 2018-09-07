var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var gulpStylelint = require('gulp-stylelint');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var posthtml = require("gulp-posthtml");
var rename = require("gulp-rename");
var del = require("del");
var run = require("gulp-run");
var server = require("browser-sync").create();
 

// Компиляция и минификация препроцессорных файлов
gulp.task("style", function () {
		gulp.src("dev/sass/**/*.sass")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer()
		]))
		.pipe(gulp.dest("./build/styles"))
		.pipe(minify())
		.pipe(rename("main-min.css"))
		.pipe(gulp.dest("./build/styles"))
		.pipe(server.stream());
});

// CSS линтер. Проверь себя!

gulp.task("lint-css", function lintCssTask () {
	return gulp.src("./build/styles/*.css")
		.pipe(gulpStylelint({
			reporters: [
			{formatter: 'string', console: true}
			]
		}));

});

// Запускаем локальный сервер browsersync
gulp.task("serve", function () {
	server.init({
		server: "./",
		port: 3000 
	});

// При изменений файлов, обновляем страницу
	gulp.watch("dev/sass/**/*.sass", ["style"]);
	gulp.watch("*.html", ["html"])
		.on("change", server.reload);

});

// Минификация картинок
gulp.task("images", function() {
	return gulp.src("dev/img/**/*.{png, jpg, svg}")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
		]))
		.pipe(gulp.dest("./build/img"));
});

// Переводим картинки в webp
gulp.task("webp", function() {
	return gulp.src("./dev/img/**/*.{png, jpg}")
		.pipe(webp({quality: 90}))
		.pipe(gulp.dest("./build/img"));
});

// Прогоняем HTML через постпроцессор
gulp.task("html", function() {
	return gulp.src("dev/*.html")
		.pipe(posthtml())
		.pipe(gulp.dest("./"));
});

// Копируем файлы в build
gulp.task("copy", function() {
	return gulp.src([
		"dev/fonts/**/*",
		"dev/img/**",
		"dev/sass/**",
		"dev/js/**"
		], {
			base: "dev/"
		})
		.pipe(gulp.dest("./build"));
});

// Очищаем build
gulp.task("clean", function() {
	return del("./build");
});

// Запускаем таски последовательно
gulp.task("build", function (done) {
	gulpSequence(
		"clean",
		"copy",
		"style",
		"html",
		"images",
		done
		)
});