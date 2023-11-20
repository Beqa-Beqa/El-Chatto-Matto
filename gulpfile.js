const {src, dest, watch, series} = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const purgecss = require("gulp-purgecss");

function buildStyles() {
  return src("./src/styles/**/*.scss")
    .pipe(sass())
    .pipe(purgecss({ content: ['./src/**/*.tsx']}))
    .pipe(dest("./src/styles/sass-compiled-css"));
}

function watchTask() {
  watch(['styles/**/*.scss', './src/**/*.tsx'], buildStyles);
}

exports.default = series(buildStyles, watchTask);