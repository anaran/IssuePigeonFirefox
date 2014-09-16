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
        github = function GithubReporter(aLocation) {
          let base = aLocation.pathname.match(this.matcher)[0];
          this.helpLink = aLocation.origin + base + '/wiki';
          this.reportLink = aLocation.origin + base + '/issues/new'
        },
        chromium = function ChromiumReporter() {
        },
        chromeApps = function ChromeAppsReporter() {
          this.helpLink = 'https://developer.chrome.com/apps/faq';
          this.reportLink = 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Apps';
        },
        chromeExtensions = function ChromeExtensionsReporter() {
          this.helpLink = 'https://developer.chrome.com/extensions/faq';
          this.reportLink = 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Extensions';
        },
        mdn = function MdnReporter() {
          self.postMessage('I know nothing -- ' + this.constructor.name);
        },
        amo = function AmoReporter() {
          self.postMessage('I know nothing -- ' + this.constructor.name);
        },
        npm = function NpmReporter() {
          self.postMessage('I know nothing -- ' + this.constructor.name);
        },
        w3html5 = function W3html5Reporter() {
          self.postMessage('I know nothing -- ' + this.constructor.name);
        },
        cm = function CmReporter() {
          self.postMessage('I know nothing -- ' + this.constructor.name);
        },
        bugzilla = function BugzillaReporter() {
        },
        PigeonDispatcher = {
          extractLinksFromSelection: function () {
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
          knownOrigins: {
            'https://developer.mozilla.org': mdn,
            'https://addons.mozilla.org': amo,
            // staging site for AMO
            'https://addons.allizom.org': amo,
            'https://developer.chrome.com/apps': chromeApps,
            'https://developer.chrome.com/extensions': chromeExtensions,
            // github reporter uses argument passed to it to derive help
            // and report URL.
            'https://github.com': github,
            'https://www.npmjs.org': npm,
            'http://dev.w3.org/html5': w3html5,
            // 'https://groups.google.com/forum/#!forum/mozilla-labs-jetpack':
            // 'https://groups.google.com/forum/#!forum/mozilla.dev.extensions':
            'http://codemirror.net/': cm
          }
        };
    github.prototype.matcher = /^\/[^/]+\/[^/#?]+/;
    github.prototype.report = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.helpLink && window.open(this.helpLink, '_blank', strWindowFeatures);
      this.reportLink && window.open(this.reportLink
                  + '?title=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                  + '&body='
                  + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                               + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString()), '_blank', strWindowFeatures
                 );
      return true;
    };
    chromium.prototype.report = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.helpLink && window.open(this.helpLink, null, strWindowFeatures);
      this.reportLink && window.open(this.reportLink + '&comment='
                                     + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                                  + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
                                     + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), null, strWindowFeatures
                                    );
      return true;
    };
    bugzilla.prototype.report = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.helpLink && window.open(this.helpLink, '_blank', strWindowFeatures);
      var link = this.reportLink && this.reportLink + '&comment='
            + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                         + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString())
            + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
            + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON &&       console.log(this, link);
      this.reportLink && window.open(link, '_blank', strWindowFeatures);
      return true;
    };
    mdn.prototype = Object.create(bugzilla.prototype);
    mdn.prototype.constructor = bugzilla;
    mdn.prototype.helpLink = 'https://developer.mozilla.org/en-US/docs/MDN/About#Documentation_errors';
    mdn.prototype.reportLink = 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=Developer%20Documentation';
    amo.prototype = Object.create(bugzilla.prototype);
    amo.prototype.constructor = bugzilla;
    amo.prototype.helpLink = 'https://addons.mozilla.org/en-US/developers/docs/policies/contact';
    amo.prototype.reportLink = 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org';

    chromeApps.prototype = Object.create(chromium.prototype);
    chromeApps.prototype.constructor = chromium;
    chromeExtensions.prototype = Object.create(chromium.prototype);
    chromeExtensions.prototype.constructor = chromium;
    npm.prototype = Object.create(github.prototype);
    npm.prototype.constructor = github;
    npm.prototype.reportLink = 'https://github.com/npm/npm-www';
    w3html5.prototype = Object.create(bugzilla.prototype);
    w3html5.prototype.reportLink = 'https://www.w3.org/Bugs/Public/enter_bug.cgi?format=__default__&product=HTML%20WG&component=HTML5%20spec';
    cm.prototype = Object.create(github.prototype);
    cm.prototype.constructor = github;
    cm.prototype.helpLink = 'https://github.com/marijnh/CodeMirror/blob/master/CONTRIBUTING.md#submitting-bug-reports';
    cm.prototype.reportLink = 'https://github.com/marijnh/CodeMirror';
    var reportFeedbackInformation = function reportFeedbackInformation() {
      let copyright = document.querySelector('meta[name=copyright]'),
          keywords = document.querySelector('meta[name=keywords]'),
          description = document.querySelector('meta[name=description]'),
          author = document.querySelector('meta[name=author]'),
          generator = document.querySelector('meta[name=generator]'),
          mailtos = [
          ];
      // TODO Please see
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-substrings
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (value) {
        mailtos.push(value.href);
      });
      var gpluses = [
      ];
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://plus.google.com/"]'), function (value) {
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
        url: document.URL,
        selection: window.getSelection().toString(),
        rangeLinks: PigeonDispatcher.extractLinksFromSelection()
      };
      var handler = PigeonDispatcher.knownOrigins[window.location.origin]
            || PigeonDispatcher.knownOrigins[
              window.location.origin
                + window.location.pathname.split("/", 2).join("/")];
      if (handler && (new handler(window.location)).report()) {
        self.postMessage('reported by ' + handler.prototype.constructor.name);
      } else {
      DEBUG_ADDON &&
        self.postMessage('potential feedback information\n'
                         + JSON.stringify(data, null, 2));
      }
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
  }
  catch (exception) {
    // DEBUG_ADDON &&
    // console.error(new Error());
    // DEBUG_ADDON &&
    console.error(exception);
  }
})();
