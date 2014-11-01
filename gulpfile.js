var gulp =        require('gulp'),
    screener =   require('./index')

// No a 'real' gulp construct ..
gulp.task('template', function() {
  screener('responses.csv', 'template.html')
})

gulp.task('watch', function() {
  return gulp.watch(['./template.html', './index.js'], ['template'])
})

gulp.task('default', ['template'])
