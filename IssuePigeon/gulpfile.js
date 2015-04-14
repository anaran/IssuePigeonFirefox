// Include gulp
var gulp = require('gulp');

var gulpMarked = require('gulp-marked');
var marked = require('./lib/marked');

var toc = [];
var addTableOfContents = function (err, out) {
  var tocHTML = '<h1 id="table-of-contents">Table of Contents</h1>\n<ul>';
  toc.forEach(function (entry) {
    tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
  });
  tocHTML += '</ul>\n';
  return tocHTML + out;
};

var renderer = (function() {
  var renderer = new marked.Renderer();
  renderer.heading = function(text, level, raw) {
    var anchor = this.options.headerPrefix + raw.toLowerCase().replace(/[^\w]+/g, '-');
    toc.push({
      anchor: anchor,
      level: level,
      text: text
    });
    return '<h'
      + level
      + ' id="'
      + anchor
      + '">'
      + text
      + '</h'
      + level
      + '>\n'
      + '<a href="#table-of-contents">Table of Contents<a>\n';
  };
  return renderer;
})();

// Requires https://github.com/lmtm/gulp-marked/pull/15
gulp.task('md2html', function() {
  gulp.src(['../*.md', './*.md'])
    .pipe(gulpMarked({
      renderer: renderer,
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    }, addTableOfContents))
    .pipe(gulp.dest('./html/'));
});
