var gulp = require('gulp');
var g = require('gulp-load-plugins')(gulp);
var jscs = require('gulp-jscs-with-reporter');
var fs = require('fs');
var gulpsync = require('gulp-sync')(gulp);

gulp.task('compress', function() {
    return gulp
        .src('dist/angular-dijalog.min.js')
        .pipe(g.gzip({
            append: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', function() {
    return gulp
        .src('src/angular-dijalog.js')
        .pipe(g.sourcemaps.init())
        .pipe(g.uglify({
            drop_debugger: true,
            drop_console: true
        }))
        .pipe(g.rename({
            suffix: ".min"
        }))
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['default'], function(){
    g.connect.server({
        hostname: '0.0.0.0',
        port: 8088,
        root: ['test', '.']
    });
});

gulp.task('jshint', function () {
    return gulp.src('src/**/*.js')
        .pipe(g.jshint('.jshintrc'))
        .pipe(g.jshint.reporter('gulp-jshint-html-reporter', {
            filename: __dirname + '/dist/jshint.html'
        }));
});

gulp.task('jscs', function () {
    return gulp.src('src/**/*.js')
        .pipe(jscs(
            JSON.parse(fs.readFileSync('.jscsrc'))
        ))
        .pipe(jscs.reporter('gulp-jscs-html-reporter', {
            filename: __dirname + '/dist/jscs.html'
        }))
});

gulp.task('dist', gulpsync.sync(['minify', 'compress']));
gulp.task('default', ['serve']);
