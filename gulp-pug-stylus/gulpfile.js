'use strict';

const gulp = require('gulp');
const pug = require('gulp-pug');
const browserSync = require('browser-sync').create();
const axis = require('axis');
const postcss = require('gulp-postcss');
const lost = require('lost');
const autoprefixer = require('autoprefixer');
const rupture = require('rupture');
const sourcemaps = require('gulp-sourcemaps');
const stylus = require('gulp-stylus');
const terser = require('gulp-terser');
const del = require('del');
const emitty = require('emitty').setup('src/pug', 'pug');
const gulpif = require('gulp-if');
const imagemin = require('gulp-imagemin');
const { src, dest, parallel, series, watch, lastRun } = require('gulp');

const sources = {
  pug: ['src/pug/pages/*.pug', 'src/pug/index.pug'],
  stylus: 'src/stylus/master.styl',
  js: 'src/js/*.js',
  img: 'src/img/*',
};

const destinations = {
  html: 'build',
  css: 'build/css',
  js: 'build/js',
  img: 'build/img',
};

// browser-sync task for starting the server.

function serve(done) {
  browserSync.init({
    server: {
      baseDir: 'build',
    },
    notify: false,
  });
  done();
}

function reload(done) {
  browserSync.reload();
  done();
}

function clean() {
  return del('./build');
}

function stylusToCSS() {
  return src(sources.stylus)
    .pipe(sourcemaps.init())
    .pipe(stylus({ use: [axis(), rupture()] }))
    .pipe(postcss([lost(), autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(destinations.css))
    .pipe(browserSync.stream());
}

function scripts() {
  return src(sources.js)
    .pipe(terser())
    .pipe(dest(destinations.js))
    .pipe(browserSync.stream());
}

function templates() {
  return new Promise((resolve, reject) => {
    emitty.scan(global.emittyChangedFile).then(() => {
      gulp
        .src('src/pug/pages/*.pug')
        .pipe(gulpif(global.watch, emitty.filter(global.emittyChangedFile)))
        .pipe(pug({ verbose: true }))
        .pipe(gulp.dest('build'))
        .on('end', resolve)
        .on('error', reject);
    });
  });
}

function watcher(done) {
  global.watch = true;
  watch('src/pug/**/*.pug', series(templates, reload)).on(
    'all',
    (event, filepath) => {
      global.emittyChangedFile = filepath;
    }
  );
  watch('src/stylus/**/*.styl', stylusToCSS);
  watch(sources.js, scripts);
  done();
}

function img() {
  return src(sources.img)
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(dest(destinations.img));
}

exports.stylusToCSS = stylusToCSS;
exports.img = img;
exports.templates = templates;
exports.watcher = watcher;
exports.clean = clean;
exports.scripts = scripts;
exports.default = series(
  parallel(templates, stylusToCSS, scripts, img),
  parallel(watcher, serve)
);
