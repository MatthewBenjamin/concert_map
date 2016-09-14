var gulp = require('gulp')
    htmlmin = require('gulp-htmlmin')
    jshint = require('gulp-jshint')
    bower = require('gulp-bower')
    shell = require('gulp-shell');

gulp.task('lint', function() {
    return gulp.src('development/js/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('requirejs', shell.task([
    'r.js -o development/js/app.build.js'
]));

gulp.task('html', function() {
    var params = {
        collapseWhitespace: true,
    }
    return gulp.src('development/*.html')
        .pipe(htmlmin(params))
        .pipe(gulp.dest('build/'));
});

gulp.task('bower'), function() {
    return bower('./my_bower_components')
        .pipe(gulp.dest('lib/'))
}

gulp.task('default', ['requirejs', 'html']);