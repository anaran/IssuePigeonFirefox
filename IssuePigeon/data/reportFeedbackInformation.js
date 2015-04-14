/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
;(function() {
  let DEBUG_ADDON = false;
  try {
    // var exports = exports || {};
    //
    // NOTE Set "DEBUG_ADDON = true" in the debugger before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    if (DEBUG_ADDON) {
      // debugger is statement, not expression.
      // DEBUG_ADDON && debugger;
      // causes exception.
      debugger;
    }
    let avoidCircular4 = function (element, indent) {
      let seen = {
      };
      return JSON.stringify(element, function (key, value) {
        // console.log('this', this);
        // console.log('key', key);
        // console.log('typeof key', typeof key);
        // console.log('typeof value', typeof value);
        if (key) {
          if (value === element) {
            console.error('reference to top-level');
            return 'reference to top-level';
          }
          if (value === this) {
            console.error('reference to self');
            return 'reference to self';
          }
          if (value && value.hasOwnProperty('prototype')) {
            if (typeof value == 'function') {
              if (value.name) {
                if (value.prototype.constructor && value.prototype.constructor.name) {
                  console.log(value.name, 'has prototype.constructor', value.prototype.constructor.name);
                  return 'constructor ' + value.prototype.constructor.name;
                } else {
                  console.log(value.name, 'has prototype', value.prototype.constructor.name);
                  return 'anon constructor ' + value.prototype.constructor.toSource().substring(0, 80);
                }
              } else {
                // console.log(value.toSource().substring(0, 80), 'has prototype', value.prototype.toSource().substring(0, 80));
              }
            } else {
              console.error(value.prototype);
            }
          }
          if (typeof value == "function") {
            if (value.name) {
              console.log('value.name', value.name);
              return value.toSource().substring(0, 80);
            } else {
              console.log('value.toSource().substring(0, 80)', value.toSource().substring(0, 80));
            }
          }
          return value;
        } else {
          console.log('-----------------------------------------');
          return value;
        }
      }, indent);
    };
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
    // Causes the same warning like all cross-site links opened programmatically.
    // let strWindowFeatures = undefined,
    let strWindowFeatures = 'resizable=yes,scrollbars=yes,toolbar=yes',
        jira = function JiraReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        bugzilla = function BugzillaReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        chromium = function ChromiumReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        github = function GithubReporter(aLocation, options) {
          let base = aLocation.pathname.match(options.matcher || /^\/[^/]+\/[^/#?]+/)[0];
          this.help = options.help || aLocation.origin + base + '/wiki';
          this.report = options.report || aLocation.origin + base + '/issues/new';
        },
        mailto = function MailToReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        wikipedia = function WikipediaReporter(aLocation, options) {
          let matches = (options.matcher || /^((?:\/[^/]+)+)\/([^/#?]+)/).exec(aLocation.pathname);
          this.help = options.help;
          this.report = options.report || aLocation.origin + '/w/index.php?title=Talk:'+matches[2]+'&action=edit';
        },
        constructors = {
          bugzilla: bugzilla,
          chromium: chromium,
          github: github,
          wikipedia: wikipedia,
          mailto: mailto
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
          // NOTE: Keep double-quotes, don't use bare word keys so entries are directly usable in
          // "Extend Issue Pigeon" textarea.
          knownOrigins: {}
        };
    jira.prototype.fly = function () {
      // See https://developer.atlassian.com/display/JIRADEV/JIRA+REST+API+Example+-+Create+Issue#JIRARESTAPIExample-CreateIssue-Exampleofcreatinganissueusingprojectkeysandfieldnames.
      // Request
      // curl -D- -u fred:fred -X POST --data {see below} -H "Content-Type: application/json" http://localhost:8090/rest/api/2/issue/
      // Data
      // {
      //     "fields": {
      //        "project":
      //        {
      //           "key": "TEST"
      //        },
      //        "summary": "REST ye merry gentlemen.",
      //        "description": "Creating of an issue using project keys and issue type names using the REST API",
      //        "issuetype": {
      //           "name": "Bug"
      //        }
      //    }
      // }
      return true;
    };
    bugzilla.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      var link = this.report && this.report + '&comment='
      + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                   + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n')
      + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
      + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON &&       console.log(this, link);
      this.report && window.open(link, '_blank', strWindowFeatures);
      return true;
    };
    chromium.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report + '&comment='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n')
                                 + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), '_blank', strWindowFeatures
                                );
      return true;
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
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                                );
      return true;
    };
    mailto.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report
                                 + '?subject=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                 + '&body='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                                );
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
        + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'
        + '\n\n';
        let win = window.open(this.report, '_blank', strWindowFeatures);
        avoidCircular4(win, 2);
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
    var reportFeedbackInformation = function reportFeedbackInformation(data, aTestLocation) {
      let copyright = typeof document !== 'undefined' && document.querySelector('meta[name=copyright]'),
          keywords = typeof document !== 'undefined' && document.querySelector('meta[name=keywords]'),
          description = typeof document !== 'undefined' && document.querySelector('meta[name=description]'),
          author = typeof document !== 'undefined' && document.querySelector('meta[name=author]'),
          generator = typeof document !== 'undefined' && document.querySelector('meta[name=generator]'),
          mailtos = [
          ],
          myLocation = typeof window !== 'undefined' ? window.location : aTestLocation;
      try {
            let pd = JSON.parse(data);
        let additionalSites = JSON.parse(pd.extensions);
        PigeonDispatcher.knownOrigins = pd.known;
        Object.keys(additionalSites).forEach(function (key) {
          if (PigeonDispatcher.knownOrigins.hasOwnProperty(key)) {
            console.warn('user overrides definition for',  key);
          }
          PigeonDispatcher.knownOrigins[key] = additionalSites[key];
        })
      } catch (exception) {
        console.error(exception);
      }
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
      // if (handler.type)
      if (handler && handler.type) {
        let constr = constructors[handler.type];
        let derived = function DerivedReporter() {
          constr.call(this, myLocation, handler);
        };
        derived.prototype = Object.create(constr.prototype);
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
    // Handle Android menu entry click using nativewindow.js
    if (typeof self !== 'undefined' && self.port) {
      DEBUG_ADDON &&
        console.log("self.port is true", self);
      self.port.on("show", function (data) {
        DEBUG_ADDON &&
          console.log("self.port.on show", self);
        reportFeedbackInformation(data);
      });
    }
    // Standard add-on SDK menu entry click handling
    if (typeof self !== 'undefined' && self.on) {
      DEBUG_ADDON &&
        console.log("self is true", self);
      self.on("click", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.on click", self);
        reportFeedbackInformation(data);
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
    DEBUG_ADDON && console.error(exception);
    DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
})();
