const gulp = require('gulp');
const postcss = require('gulp-postcss');
const modules = require('postcss-modules');
const autoprefixer = require('autoprefixer');
const pug = require('gulp-pug');
const path = require('path');
const fs = require('fs');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const sync = require('browser-sync').create();
const data = require('gulp-data');
const rewrite = require('connect-modrewrite');
const normalize = require('node-normalize-scss');
const neat = require('node-neat');

const p = {
  src: './src',
  dist: './dist',
  cache: 'style-cache'
}

const lib =  {
  preprocessor: 'scss',
  template: 'pug',
  style: 'postcss'
};

let getJSONFromCssModules = (cssFileName, json) => {
    const jsonFileName = path.resolve(`${ p.dist }/style.json`);
    fs.writeFileSync(jsonFileName, JSON.stringify({c: json}));
  }


function getClass(module, className) {
  const moduleFileName  = path.resolve(`${ p.dist }/style.json`);
  const classNames      = fs.readFileSync(moduleFileName).toString();
  return JSON.parse(classNames);
}

gulp.task(lib.preprocessor, () => {
  return gulp.src(`${p.src}/app.${lib.preprocessor}`)
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        normalize.includePaths,
        neat.includePaths,
        path.resolve(__dirname, `${ p.src }/global_style`)
      ]
    }))
    .pipe(gulp.dest(`${p.src}/${p.cache}/`))
});

gulp.task(lib.style, () => {
  return gulp.src(`${p.src}/${p.cache}/*.css`)
    .pipe(postcss([
      autoprefixer,
      modules({ getJSON: getJSONFromCssModules})
    ]))
    .pipe(gulp.dest(p.dist))
    .pipe(sync.stream());

});

gulp.task(lib.template, () => {
  return gulp.src(`${p.src}/pages/*.${lib.template}`)
    .pipe(data(getClass()))
    .pipe(pug({
      pretty: true,
      basedir: p.src
    }))
    .pipe(gulp.dest(p.dist))
    .pipe(sync.stream());
});

gulp.task('sync', [lib.preprocessor, lib.style] , () => {
  sync.init({
    server: {
      baseDir: p.dist,
      middleware: [
        rewrite([
          '^.([^\\.]+)$ /$1.html [L]'
        ])
      ]
    },
    open: false,
    browser: 'default',
    reloadOnRestart: true,
    notify: false
  });

  gulp.watch(`${p.src}/**/*.${lib.preprocessor}`, [lib.preprocessor]);
  gulp.watch(`${p.src}/${p.cache}/**/*.css`, [lib.style]);
  gulp.watch(`${p.src}/**/*.${lib.template}`, [lib.template]);
  gulp.watch(`${ p.dist }/style.json`, [lib.template]);
});

gulp.task('default', ['sync']);
