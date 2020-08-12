var SRC = './src';
var DST = './dist';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyHtml = require('gulp-minify-html');
var minifyCss = require('gulp-minify-css');
var rev = require('gulp-rev');
var stripDebug = require('gulp-strip-debug');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');

gulp.task('connect', function() {
  browserSync({server: DST});

  gulp.watch([
    SRC + '/**/*.js',
    SRC + '/**/*.html',
    SRC + '/assets/**/*'
  ], ['usemin', browserSync.reload]);

  gulp.watch(SRC + '/scss/*.scss', ['usemin:sass']);
});

gulp.task('jslint', function() {
  return gulp.src(SRC + '/**/*.js')
    .pipe(jshint({
      lastsemic: true
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', ['jslint'], function() {
  return gulp.src(DST, {read: false}).pipe(clean({force: true}));
});

gulp.task('copy', ['clean'], function() {
  return gulp.src([
    SRC + '/assets/*.*'
  ], {base: SRC}).pipe(gulp.dest(DST));
});

gulp.task('usemin', ['copy'], function() {
  return gulp.src(SRC + '/index.html').pipe(usemin({
    scss: [sass()]
  })).pipe(gulp.dest(DST));
});

gulp.task('usemin:sass', function() {
  return gulp.src(SRC + '/index.html').pipe(usemin({
    scss: [sass()]
  })).pipe(gulp.dest(DST)).pipe(browserSync.stream({match: "**/*.css"}));
});

gulp.task('usemin:all', ['copy'], function() {
  return gulp.src(SRC + '/index.html').pipe(usemin({
    js: [uglify({
      preserveComments: true
    }), rev()],
    scss: [sass(), minifyCss(), rev()],
    html: [minifyHtml()]
  })).pipe(gulp.dest(DST));
});

gulp.task('stripDebug', ['usemin:all'], function() {
  return gulp.src(DST + '/*.js').pipe(stripDebug()).pipe(gulp.dest(DST));
});


gulp.task('default', ['usemin', 'connect']);
gulp.task('dist', ['stripDebug']);