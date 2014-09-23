/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
;(function() {
  try {
    let DEBUG_ADDON = false;
    //
    // NOTE Set "DEBUG_ADDON = true" in the debugger before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    debugger;
    DEBUG_ADDON &&
      console.log('Logging enabled via debugger');
    let loading = "content script $Format:%h%d$ loads in " + ((typeof document !== 'undefined' && document.URL) || 'no document (unit stesting?)') +
        " using " + JSON.stringify((typeof navigator !== 'undefined' && navigator.userAgent) || 'no navigator (unit stesting?)') + ' ' +
        // NOTE: Introduce fragment specifier before line spec to make
        // clickable link work in console.log.
        (new Error).stack.replace(/:(\d+):(\d+)/g, '#L$1C$2');
    DEBUG_ADDON &&
      console.log(loading);
    // TODO Place following code where timed section should start.
    if (console.time) {
      DEBUG_ADDON &&
        console.time('load time');
    }
    if (console.profile) {
      DEBUG_ADDON &&
        console.log('start profiling');
      DEBUG_ADDON &&
        console.profile('content script profile');
    }
    let strWindowFeatures = 'resizable=yes,scrollbars=yes,toolbar=yes',
        github = function GithubReporter(aLocation, options) {
          let base = aLocation.pathname.match(options.matcher || /^\/[^/]+\/[^/#?]+/)[0];
          this.help = options.help || aLocation.origin + base + '/wiki';
          this.report = options.report || aLocation.origin + base + '/issues/new';
        },
        chromium = function ChromiumReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        bugzilla = function BugzillaReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        wikipedia = function WikipediaReporter(aLocation, options) {
          let matches = (options.matcher || /^((?:\/[^/]+)+)\/([^/#?]+)/).exec(aLocation.pathname);
          this.help = options.help;
          this.report = options.report || aLocation.origin + '/w/index.php?title=Talk:'+matches[2]+'&action=edit';
        },
        PigeonDispatcher = {
          extractLinksFromSelection: function () {
            var s = typeof window !== 'undefined' && window.getSelection();
            var rangeLinks = {
            };
            if (s) {
              for (var i = 0; i < s.rangeCount; i++) {
                var rc = s.getRangeAt(i).cloneContents();
                rc.querySelectorAll
                && Array.prototype.forEach.call(rc.querySelectorAll('a[href]'), function (value) {
                  rangeLinks[value.href] = true;
                });
              }
            }
            return Object.keys(rangeLinks);
          },
          knownOrigins: {
            'https://developer.mozilla.org': {
              type: bugzilla,
              help: 'https://developer.mozilla.org/en-US/docs/MDN/About#Documentation_errors',
              report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=Developer%20Documentation' },
            'https://addons.mozilla.org': {
              type: bugzilla,
              help: 'https://addons.mozilla.org/en-US/developers/docs/policies/contact',
              report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org' },
            // staging site for AMO
            'https://addons.allizom.org': {
              type: bugzilla,
              help: 'https://addons.mozilla.org/en-US/developers/docs/policies/contact',
              report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org' },
            'https://developer.chrome.com/apps': {
              type: chromium,
              help: 'https://developer.chrome.com/apps/faq',
              report: 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Apps' },
            'https://developer.chrome.com/extensions': {
              type: chromium,
              help: 'https://developer.chrome.com/extensions/faq',
              report: 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Extensions' },
            // github reporter uses argument passed to it to derive help
            // and report URL.
            'https://github.com': {
              type: github },
            'https://www.npmjs.org': {
              type: github,
              report: 'https://github.com/npm/npm-www/issues/new' },
            'http://dev.w3.org/html5': {
              type: bugzilla,
              report: 'https://www.w3.org/Bugs/Public/enter_bug.cgi?format=__default__&product=HTML%20WG&component=HTML5%20spec' },
            // 'https://groups.google.com/forum/#!forum/mozilla-labs-jetpack':
            // 'https://groups.google.com/forum/#!forum/mozilla.dev.extensions':
            'http://codemirror.net': {
              type: github,
              // NOTE Not neded. A link to CONTRIBUTING.md is shown when reporting new issues.
              // help: 'https://github.com/marijnh/CodeMirror/blob/master/CONTRIBUTING.md#submitting-bug-reports',
              report: 'https://github.com/marijnh/CodeMirror/issues/new' },
            'https://en.wikipedia.org': {
              help: 'https://en.wikipedia.org/wiki/Wikipedia:Contact_us_-_Readers',
              type: wikipedia
            }
          }
        };
    // github.prototype.matcher = /^\/[^/]+\/[^/#?]+/;
    github.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report
                                 + '?title=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                 + '&body='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString()), '_blank', strWindowFeatures
                                );
      return true;
    };
    chromium.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report + '&comment='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
                                 + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), '_blank', strWindowFeatures
                                );
      return true;
    };
    bugzilla.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      var link = this.report && this.report + '&comment='
      + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                   + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
      + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
      + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON &&       console.log(this, link);
      this.report && window.open(link, '_blank', strWindowFeatures);
      return true;
    };
    // wikipedia.prototype.matcher = /^((?:\/[^/]+)+)\/([^/#?]+)/;
    wikipedia.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      if (this.report) {
        let addition = (rangeLinks.length
                        ? '\nSee these links:\n\n' + rangeLinks.join('\n')
                        + '\n\n  referenced from\n\n' : 'See:\n\n')
        + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString()
        + '\n\n';
        let win = window.open(this.report, '_blank', strWindowFeatures);
//         let onReady = function (event) {
//           DEBUG_ADDON &&       console.log(event.target);
//           if (event.target.readyState !== 'complete') {
//             return;
//           }
        setTimeout(function () {
          let ta = win.document.querySelector('textarea#wpTextbox1.mw-ui-input');
          if (ta) {
            ta.value = addition + ta.value;
          }
        }, 3000);
//         };
//         win.onload = function () {
//         win.addEventListener('readystatechange', onReady, false);
        }
      return true;
    };
    var reportFeedbackInformation = function reportFeedbackInformation(aTestLocation) {
      let copyright = typeof document !== 'undefined' && document.querySelector('meta[name=copyright]'),
          keywords = typeof document !== 'undefined' && document.querySelector('meta[name=keywords]'),
          description = typeof document !== 'undefined' && document.querySelector('meta[name=description]'),
          author = typeof document !== 'undefined' && document.querySelector('meta[name=author]'),
          generator = typeof document !== 'undefined' && document.querySelector('meta[name=generator]'),
          mailtos = [
          ],
          myLocation = typeof window !== 'undefined' ? window.location : aTestLocation;
      // TODO Please see
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-substrings
      Array.prototype.forEach.call(typeof document !== 'undefined' && document.querySelectorAll('a[href^="mailto:"]'), function (value) {
        mailtos.push(value.href);
      });
      var gpluses = [
      ];
      Array.prototype.forEach.call(typeof document !== 'undefined' && document.querySelectorAll('a[href^="https://plus.google.com/"]'), function (value) {
        gpluses.push(value.href);
      });
      var data = {
        knownOrigins: Object.getOwnPropertyNames(PigeonDispatcher.knownOrigins),
        copyright: copyright && copyright.content,
        keywords: keywords && keywords.content,
        description: description && description.content,
        author: author && author.content,
        generator: generator && generator.content,
        mailtos: mailtos,
        gpluses: gpluses,
        url: typeof document !== 'undefined' && document.URL,
        selection: typeof window !== 'undefined' && window.getSelection().toString(),
        rangeLinks: PigeonDispatcher.extractLinksFromSelection()
      };
      var handler = PigeonDispatcher.knownOrigins[myLocation.origin]
      || PigeonDispatcher.knownOrigins[
        myLocation.origin
        + myLocation.pathname.split("/", 2).join("/")];
      if (handler && handler.type) {
        let derived = function DerivedReporter() {
          handler.type.call(this, myLocation, handler);
        };
        derived.prototype = Object.create(handler.type.prototype);
        derived.prototype.constructor = derived;
        //         if (handler.help) {
        //           derived.prototype.help = handler.help;
        //         }
        //         if (handler.report) {
        //           derived.prototype.report = handler.report;
        //         }
        if ((new derived()).fly()) {
          DEBUG_ADDON &&
            self.postMessage('reported by ' + derived.prototype.constructor.name);
        }
      } else {
        self.postMessage('potential feedback information\n'
                         + JSON.stringify(data, null, 2));
      }
      return aTestLocation;
    };
    if (typeof self !== 'undefined' && self.port) {
      DEBUG_ADDON &&
        console.log("self.port is true", self);
      self.port.on("show", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.port.on show", self);
        reportFeedbackInformation();
      });
    }
    if (typeof self !== 'undefined' && self.on) {
      DEBUG_ADDON &&
        console.log("self is true", self);
      self.on("click", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.on click", self);
        reportFeedbackInformation();
      });
    }
    // TODO Place following code where timed section should end.
    if (console.timeEnd) {
      DEBUG_ADDON &&
        console.timeEnd('load time');
    }
    if (console.profileEnd) {
      DEBUG_ADDON &&
        console.log('end profiling');
      DEBUG_ADDON &&
        console.profileEnd();
    }
    exports.PigeonDispatcher = PigeonDispatcher;
    exports.reportFeedbackInformation = reportFeedbackInformation;
  }
  catch (exception) {
    // DEBUG_ADDON &&
    // console.error(new Error());
    // DEBUG_ADDON &&
    console.error(exception);
  }
})();
