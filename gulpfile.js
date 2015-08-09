var gulp = require('gulp')
    uglify = require('gulp-uglify')
    minifyCSS = require('gulp-minify-css')
    minifyHTML = require('gulp-minify-html')
    jshint = require('gulp-jshint');

gulp.task('lint', function() {
    return gulp.src('development/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
    gulp.src('development/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/js'));
});

gulp.task('styles', function() {
    gulp.src('development/css/*.css')
        .pipe(minifyCSS())
        .pipe(gulp.dest('build/css/'));
});

gulp.task('html', function () {
    gulp.src('development/*.html')
        .pipe(minifyHTML())
        .pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
    gulp.watch('development/js/*.js', ['scripts']);
    gulp.watch('development/css/*.css', ['styles']);
    gulp.watch('development/*.html', ['html']);
});

gulp.task('default', ['scripts', 'styles', 'html', 'watch']);