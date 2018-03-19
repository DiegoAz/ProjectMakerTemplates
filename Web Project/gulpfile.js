  var accord      = require('gulp-accord');
  var axis        = require('axis');
  var browserSync = require('browser-sync').create();
  var gulp        = require('gulp');
  var pug         = require('gulp-pug');
  var lost        = require('lost');
  var postcss     = require('gulp-postcss');
  var prefixer    = require('autoprefixer');
  var reload      = browserSync.reload;
  var rupture     = require('rupture');
  var sourcemaps  = require('gulp-sourcemaps');
  var stylus      = require('gulp-stylus');
  var uglify      = require('gulp-uglify');
  // var imagemin = require('gulp-imagemin');

  var src = {
    pug  : 'dirty/_pug/index.pug',
    stylus: 'dirty/_stylus/_master.styl',
    js    : 'dirty/js/*.js',
    img   : 'dirty/img/*'
  };

  var dest = {
    html: 'final',
    css : 'final/css',
    js  : 'final/js',
    img : 'final/img'
  }

// browser-sync task for starting the server.

gulp.task('browser-sync', function() {
    browserSync.init({
      server: { baseDir: "final" },
      notify: false,
      browser: ["chrome"]
    });
});

// stylus to css

gulp.task('stylus', function() {
  return gulp.src(src.stylus)
    .pipe(sourcemaps.init())
    .pipe(accord ('stylus', ({use: [axis(), rupture()]})))
    .on('error', errorLog)
    .pipe(postcss([
      lost(),
      prefixer({ browsers: ['last 2 version'] })
    ]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dest.css))
    .pipe(reload({stream:true}));
});

// pug to html ...

gulp.task('pug', function() {
     gulp.src(src.pug)
    .pipe(pug())
    .on('error', errorLog)
    .pipe(gulp.dest(dest.html))
    .pipe(reload({stream:true}));
});

// js uglify

gulp.task('js', function() {
  return gulp.src(src.js)
    .pipe(uglify())
    .pipe(gulp.dest(dest.js))
    .pipe(reload({stream:true}));
});

// compress images

gulp.task('img', function() {
  return gulp.src(src.img)
    .pipe(imagemin({
      progressive:true
    }))
    .pipe(gulp.dest(dest.img));

});

// watch dirty folder files for changes and execute the appropriate tasks

gulp.task('watch', ['pug', 'stylus',  'js', 'browser-sync'], function() {
  gulp.watch([src.pug, 'dirty/_pug/**/*.pug'], ['pug']);
  gulp.watch([src.stylus, 'dirty/_stylus/**/*.styl'], ['stylus']);
  gulp.watch(src.js, ['js']);
});

gulp.task('default', ['watch']);

// Manejo de errores

 function errorLog (error) {
    console.error('%s\n%s:%s\n%s',
      '-----Error-----',
      'Plugin', (error.plugin).toString(),
      (error.message).toString());
    this.emit('end');
  }

