const gulp = require('gulp');
const postcss = require('gulp-postcss');
const modules = require('postcss-modules');
const autoprefixer = require('autoprefixer');
const ejs = require('gulp-ejs');
const path = require('path');
const path = require('path');
const fs = require('fs');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

const p = {
  src: './src',
  dist: './dist'
}

let getJSONFromCssModules = (cssFileName, json) => {
  const cssName = path.basename(cssFileName, '.css');
  const jsonFileName = path.resolve(p.dist, `${ cssName }.json`);
  fs.writeFileSync(jsonFileName, JSON.stringify(json));
}

let getClass = (module, className) => {
  const moduleFileName  = path.resolve(p.dist, `${ module }.json`);
  const classNames      = fs.readFileSync(moduleFileName).toString();
  return JSON.parse(classNames)[className];
}

gulp.task('style', () => {
  gulp.src(`${p.src}/style/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer,
      modules({ getJSON: getJSONFromCssModules })
    ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(p.dist))
    .pipe(sync.stream());
});
