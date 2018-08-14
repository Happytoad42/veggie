var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
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
 
gulp.task("style", function () {
		gulp.src("dev/sass/*.sass")
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

gulp.task("serve", function () {
	server.init({
		server: "./build"
	});

	gulp.watch("dev/sass/*.sass", ["style"]);
	gulp.watch("dev/*.html", ["html"])
		.on("change", server.reload);

});

gulp.task("images", function() {
	return gulp.src("./img/**/*.{png, jpg, svg}")
		.pipe(imagemin([
			imagemin.optipng({optimizationLevel: 3}),
			imagemin.jpegtran({progressive: true}),
			imagemin.svgo()
		]))
		.pipe(gulp.dest("./build/img"));
});

gulp.task("webp", function() {
	return gulp.src("./img/**/*.{png, jpg}")
		.pipe(webp({quality: 90}))
		.pipe(gulp.dest("./build/img"));
});

gulp.task("html", function() {
	return gulp.src("dev/*.html")
		.pipe(posthtml())
		.pipe(gulp.dest("./build"));
});

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

gulp.task("clean", function() {
	return del("./build");
});

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