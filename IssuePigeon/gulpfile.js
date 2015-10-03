// Include gulp
var gulp = require('gulp');

var gulpMarked = require('gulp-marked');
var marked = require('./lib/marked');

var pre =
    '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '    <head>\n' +
    '        <meta charset=utf-8>\n' +
    '        <meta name="viewport" content="height=device-height, width=device-width, initial-scale=1, minimum-scale=0.25, maximum-scale=4, user-scalable=yes">\n' +
    '        <title data-l10n-id="help_title">$TITLE$</title>\n' +
    '        <link rel="icon" href="icon48.png" id="favicon" type="image/png">\n' +
    '        <link rel="stylesheet" href="../data/help.css"/>\n' +
    '    </head>\n' +
    '    <body class="help_body">\n' +
    '        <div class="help_div">\n';
var post =
    '        </div>\n' +
    '    </body>\n' +
    '</html>\n';

var toc = [];
var addTableOfContents = function (err, out) {
  var tocHTML = '<h1 id="table-of-contents">Index</h1>\n<ul>';
  toc.forEach(function (entry) {
    tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'</a></li>\n';
  });
  toc = [];
  tocHTML += '</ul>\n';
  return pre + out + tocHTML + post;
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
    + '<a href="#table-of-contents">Index</a>\n';
  };
  return renderer;
})();

// Requires https://github.com/lmtm/gulp-marked/pull/15
gulp.task('md2html', function() {
  gulp.src(['data/*.md'])
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
  .pipe(gulp.dest('data/'));
});
