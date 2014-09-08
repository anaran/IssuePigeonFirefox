/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
'use strict';
//
// Author: adrian.aichner@gmail.com
// Lives in private git repository "javascript.git"
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
    let loading = "content script $Format:%h%d$ loads in " + document.URL +
        " using " + JSON.stringify(navigator.userAgent) + ' ' +
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
    var reportFeedbackInformation = function () {
      var copyright = document.querySelector('meta[name=copyright]'),
          keywords = document.querySelector('meta[name=keywords]'),
          description = document.querySelector('meta[name=description]'),
          author = document.querySelector('meta[name=author]'),
          generator = document.querySelector('meta[name=generator]'),
          strWindowFeatures = 'resizable=yes,scrollbars=yes,toolbar=yes',
          extractLinksFromSelection = function () {
            var s = window.getSelection();
            var rangeLinks = {
            };
            for (var i = 0; i < s.rangeCount; i++) {
              var rc = s.getRangeAt(i).cloneContents();
              rc.querySelectorAll
              && Array.prototype.forEach.call(rc.querySelectorAll('a[href]'), function (value) {
                rangeLinks[value.href] = true;
              });
            }
            return Object.keys(rangeLinks);
          },
          githubReporter = function (base) {
            let rangeLinks = extractLinksFromSelection();
            base && window.open(base + '/wiki', '_blank', strWindowFeatures);
            base && window.open(base + '/issues/new'
                                + '?title=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                + '&body='
                                + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                             + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString()), '_blank', strWindowFeatures
                               );
          },
          npmReporter = function () {
            githubReporter(this.report);
          },
          mozillaReporter = function () {
            let rangeLinks = extractLinksFromSelection();
            this.help && window.open(this.help, '_blank', strWindowFeatures);
            var link = this.report + '&comment='
            + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                         + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
            + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
            + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
            DEBUG_ADDON &&       console.log(this, link);
            this.report && window.open(link, '_blank', strWindowFeatures);
          },
          chromiumReporter = function () {
            let rangeLinks = extractLinksFromSelection();
            this.help && window.open(this.help, null, strWindowFeatures);
            this.report && window.open(this.report + '&comment='
                                       + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                                    + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
                                       + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
                                       + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), null, strWindowFeatures
                                      );
          },
          mdn = {
            'help': 'https://developer.mozilla.org/en-US/docs/MDN/About#Documentation_errors',
            'report': 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=Developer%20Documentation',
            'reporter': mozillaReporter
          },
          amo = {
            'help': 'https://addons.mozilla.org/en-US/developers/docs/policies/contact',
            'report': 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org',
            'reporter': mozillaReporter
          },
          dcca = {
            'help': 'https://developer.chrome.com/apps/faq',
            'report': 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Apps',
            'reporter': chromiumReporter
          },
          dcce = {
            'help': 'https://developer.chrome.com/extensions/faq',
            'report': 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Extensions',
            'reporter': chromiumReporter
          },
          github = {
            'reporter': githubReporter
          },
          npm = {
            'report': 'https://github.com/npm/npm-www',
            'reporter': npmReporter
          },
          w3html5 = {
            report: 'https://www.w3.org/Bugs/Public/enter_bug.cgi?format=__default__&product=HTML%20WG&component=HTML5%20spec',
            reporter: mozillaReporter
          },
          knownSites = {
            'https://developer.mozilla.org': mdn,
            'https://addons.mozilla.org': amo,
            // staging site for AMO
            'https://addons.allizom.org': amo,
            'https://developer.chrome.com/apps': dcca,
            'https://developer.chrome.com/extensions': dcce,
            // github reporter uses argument passed to it to derive help
            // and report URL.
            // NOTE Make sure not to include any fragment or query parts.
            'https://github.com/[^/]+/[^/#?]+': github,
            'https://www.npmjs.org': npm,
            'http://dev.w3.org/html5': w3html5
            // 'https://groups.google.com/forum/#!forum/mozilla-labs-jetpack':
            // 'https://groups.google.com/forum/#!forum/mozilla.dev.extensions':
          },
          mailtos = [
          ];
      // TODO Please see http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-substrings
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (value) {
        mailtos.push(value.href);
      });
      var gpluses = [
      ];
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://plus.google.com/"]'), function (value) {
        gpluses.push(value.href);
      });
      var data = {
        knownSites: Object.getOwnPropertyNames(knownSites),
        copyright: copyright && copyright.content,
        keywords: keywords && keywords.content,
        description: description && description.content,
        author: author && author.content,
        generator: generator && generator.content,
        mailtos: mailtos,
        gpluses: gpluses,
        url: document.URL,
        selection: window.getSelection().toString(),
        rangeLinks: extractLinksFromSelection()
      };
      var handler = Object.keys(knownSites).some(function (value) {
        var captureGroups = value.match(/^\/?(.+?)(?:\/([gim]*))?$/);
        var regexp = new RegExp(captureGroups[1], captureGroups[2]);
        var match = window.location.href.match(regexp);
        if (match) {
          knownSites[value].reporter(match[0]);
          return true;
        }
        return false;
      });
      if (handler) {
      } else {
        self.postMessage('potential feedback information\n'
                         + JSON.stringify(data, null, 2));
      }
    };
    if (self.port) {
      DEBUG_ADDON &&
        console.log("self.port is true", self);
      self.port.on("show", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.port.on show", self);
        reportFeedbackInformation();
      });
    }
    if (self.on) {
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
  }
  catch (exception) {
    // DEBUG_ADDON &&
    console.error(new Error());
    DEBUG_ADDON &&
      console.error(exception);
  }
})();
