'use strict';
/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
(function() {
  let DEBUG_ADDON = true;
  DEBUG_ADDON && console.log(new Error('just kidding'));
  try {
    // NOTE Set "DEBUG_ADDON = true" in the debugger before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    if (DEBUG_ADDON) {
      // debugger is statement, not expression.
      // DEBUG_ADDON && debugger;
      // causes exception.
      // debugger;
    }
    let _ = (key) => {
      // return key;
      return browser.i18n.getMessage(key);
    };
    let avoidCircular4 = function (element, indent) {
      let seen = {
      };
      return JSON.stringify(element, function (key, value) {
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
          let match = aLocation.pathname.match(options.matcher || /^\/[^/]+\/[^/#?]+/);
          if (!match || !match.length) {
            self.port.emit('unsupported', {
              title: 'Cannot match github project at ' + aLocation.href,
              aLocation: aLocation,
              match: match,
              options: options
            });
          }
          let base = match[0];
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
          knownOrigins: {}
        };
    jira.prototype.fly = function (data) {
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
    let openWindow = (url, name, features) => {
      browser.tabs.query({
        currentWindow: true,
        active: true
      }).then(tabs => {
        console.log('openWindow', tabs, tabs[0].id)
        browser.tabs.sendMessage(tabs[0].id, {
          type: 'open',
          url: url,
          name: name,
          features: features
        }).then(res => {
          console.log(res); 
        }).catch(err => {
          console.log(err);
        });
      });
    };
    bugzilla.prototype.fly = function (data) {
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      var link = this.report && this.report + '&comment='
          + window.encodeURIComponent((data.rangeLinks.length ? 'See these links:\n\n'
                                       + data.rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n')
          + '&bug_file_loc=' + window.encodeURIComponent(data.location.href)
          + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON &&       console.log(this, link);
      this.report && openWindow(link, '_blank', strWindowFeatures);
      return true;
    };
    chromium.prototype.fly = function (data) {
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      this.report && openWindow(this.report + '&comment='
                                + window.encodeURIComponent((data.rangeLinks.length ? 'See these links:\n\n'
                                                             + data.rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n')
                                + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), '_blank', strWindowFeatures
                               );
      return true;
    };
    // github.prototype.matcher = /^\/[^/]+\/[^/#?]+/;
    github.prototype.fly = function (data) {
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      this.report && openWindow(this.report
                                + '?title=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                + '&body='
                                + window.encodeURIComponent((data.rangeLinks.length ? 'See these links:\n\n'
                                                             + data.rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                               );
      return true;
    };
    mailto.prototype.fly = function (data) {
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      this.report && openWindow(this.report
                                + '?subject=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                + '&body='
                                + window.encodeURIComponent((data.rangeLinks.length ? 'See these links:\n\n'
                                                             + data.rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                               );
      return true;
    };
    // wikipedia.prototype.matcher = /^((?:\/[^/]+)+)\/([^/#?]+)/;
    wikipedia.prototype.fly = function (data) {
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      if (this.report) {
        let addition = (data.rangeLinks.length
                        ? '\nSee these links:\n\n' + data.rangeLinks.join('\n')
                        + '\n\n  referenced from\n\n' : 'See:\n\n')
            + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n'
            + '\n\n';
        let win = openWindow(this.report, '_blank', strWindowFeatures);
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
    var reportFeedbackInformation = function (data) {
      let copyright = typeof document !== 'undefined' && document.querySelector('meta[name=copyright]'),
          keywords = typeof document !== 'undefined' && document.querySelector('meta[name=keywords]'),
          description = typeof document !== 'undefined' && document.querySelector('meta[name=description]'),
          author = typeof document !== 'undefined' && document.querySelector('meta[name=author]'),
          generator = typeof document !== 'undefined' && document.querySelector('meta[name=generator]'),
          mailtos = [
          ];
      // data.location = 'location' in data ? data.location : aTestLocation;
      try {
        PigeonDispatcher.knownOrigins = window.knownOrigins;
        PigeonDispatcher.rangeLinks = data.rangeLinks;
        PigeonDispatcher.selection = data.selection;
        if ('extensions' in data) {
          let additionalSites = JSON.parse(data.extensions);
          Object.keys(additionalSites).forEach(function (key) {
            if (PigeonDispatcher.knownOrigins.hasOwnProperty(key)) {
              console.warn('user overrides definition for',  key);
            }
            PigeonDispatcher.knownOrigins[key] = additionalSites[key];
          });
        }
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
      var reportData = {
        knownOrigins: Object.getOwnPropertyNames(PigeonDispatcher.knownOrigins),
        copyright: copyright && copyright.content,
        keywords: keywords && keywords.content,
        description: description && description.content,
        author: author && author.content,
        generator: generator && generator.content,
        mailtos: mailtos,
        gpluses: gpluses,
        url: data.location.href,
        selection: data.selection,
        rangeLinks: data.rangeLinks
      };

      var handler = PigeonDispatcher.knownOrigins[data.location.origin]
          || PigeonDispatcher.knownOrigins[
            data.location.origin
              + data.location.pathname.split("/", 2).join("/")];
      // if (handler.type)
      if (handler && handler.type) {
        let constr = constructors[handler.type];
        let derived = function DerivedReporter() {
          constr.call(this, data.location, handler);
        };
        derived.prototype = Object.create(constr.prototype);
        derived.prototype.constructor = derived;
        if ((new derived()).fly(data)) {
          // FIXME: this is in fact supported, should not raise a notification!
          // (typeof self !== 'undefined') && self.port.emit('unsupported', 'reported by ' + constr.toString());
        }
        else {
          // NOTE: something went wrong for a supported site.
          (typeof self !== 'undefined') && self.port.emit('unsupported', {
            reportData: reportData,
            title: 'Cannot fly from supported site ' + data.location.href
          });
        }
        // return aTestLocation;
      }
      else {
        // This site is indeed not supported. Report it to possibly get support.
        (typeof self !== 'undefined') && self.port.emit('unsupported', {
          reportData: reportData,
          title: 'Cannot fly from unsupported site ' + data.location.href,
          data: data
        });
      }
    };
    // if (typeof self !== 'undefined' && self.port) {
    DEBUG_ADDON &&
      console.log("self.port is true", self);
    function handleMessages(message, sender, sendResponse) {
      console.log(browser.runtime.id + " bg handleMessages");
      console.log("bg handleMessages gets", message, sender, sendResponse);
      switch (message.type) {

      case 'fly_safely': {
        reportFeedbackInformation(message);
        break;
      }

      case 'help': {
        let helpURL = browser.extension.getURL(_('help_path'));
        browser.tabs.query({
          url: helpURL
        }).then(tabs => {
          if (tabs.length > 0) {
            let updating = browser.tabs.update(
              tabs[0].id,
              {
                active: true
              });
          }
          else {
            browser.tabs.create({
              // openerTabId is not supported on Android:
              // Error: Type error for parameter createProperties (Property "openerTabId" is unsupported by Firefox) for tabs.create.
              // Works fine on
              // "platform": {
              //   "os": "linux",
              //   "arch": "x86-64"
              // }
              // openerTabId: tabs[0].id,
              url: helpURL
            }).then(tab => {
              if (tab) {
                let listener = (tabId, changeInfo, tabInfo) => {
                  console.log (changeInfo.status, tabInfo);
                  if (changeInfo && (changeInfo.status == 'complete'
                                     && (tabInfo.url == helpURL))) {
                    let executing = browser.tabs.executeScript(
                      tabId,
                      {
                        file: "/localize.js"
                      }
                    ).then(() => {
                      // browser.tabs.onUpdated.removeListener(listener);
                    });
                    // let updating = browser.tabs.update(
                    //   tabId,
                    //   {
                    //     title: _('help_title'),
                    //   });
                  }
                };
                browser.tabs.onUpdated.addListener(listener);
              }
              console.log('browser.tabs.create', tabs);
            });
          }
        });
        break;
      }

      case 'settings': {
        let settingsURL = browser.extension.getURL('data/anaran-jetpack-content/settings.html');
        browser.tabs.query({
          url: settingsURL
        }).then(tabs => {
          if (tabs.length > 0) {
            let updating = browser.tabs.update(
              tabs[0].id,
              {
                active: true
              });
          }
          else {
            browser.tabs.create({
              // openerTabId is not supported on Android:
              // Error: Type error for parameter createProperties (Property "openerTabId" is unsupported by Firefox) for tabs.create.
              // Works fine on
              // "platform": {
              //   "os": "linux",
              //   "arch": "x86-64"
              // }
              // openerTabId: tabs[0].id,
              url: settingsURL
            }).then(tab => {
              if (tab) {
                let listener = (tabId, changeInfo, tabInfo) => {
                  console.log (changeInfo.status, tabInfo);
                  if (changeInfo && (changeInfo.status == 'complete')
                      && (tabInfo.url == settingsURL)) {
                    let executing = browser.tabs.executeScript(
                      tabId,
                      {
                        file: "/localize.js"
                      }
                    ).then(() => {
                      // browser.tabs.onUpdated.removeListener(listener);
                    });
                    // let updating = browser.tabs.update(
                    //   tabId,
                    //   {
                    //     title: _('settings_title'),
                    //   });
                  }
                };
                browser.tabs.onUpdated.addListener(listener);
              }
              console.log('browser.tabs.create', tabs);
            });
          }
        });
        break;
      }

      default: {
        console.log('bg handleMessages defaults, returns true');
        return true;
      }

      }
      sendResponse({ 'bg handleMessages finished with': message });
    }

              let localizedPreferences = window.optionsDefinitions.preferences.map(function(pref) {
                pref.title = _(pref.name + '_title');
                pref.description = _(pref.name + '_description');
                return pref;
              });
              let emitLoadSettings = function (data) {
                browser.runtime.sendMessage({
                  type: 'load_settings',
                  localizedPreferences: localizedPreferences,
                  prefs: window.optionsDefinitions.preferences,
                  links: [
                    {
                      textContent: _('help_menu_entry'),
                      href: browser.extension.getURL(_('help_path')),
                      id: 'help_link',
                    }, {
                      textContent: _('known_origins'),
                      href: browser.extension.getURL(_('known_origins_path')),
                      id: 'known_origins_link',
                    }
                  ]
                });
              };
              // sp.on('position', function(prefName) {
              //   emitLoadSettings();
              // });
    function handleMessages2(message, sender, sendResponse) {
      console.log(browser.runtime.id + "bg handleMessages2");
      console.log("bg handleMessages2 gets", message, sender, sendResponse);
      switch (message.type) {
        
        // case 'open': {
        //   window.open(message.url, message.name, message.features);
        //   return false;
        // }

      case 'request_settings': {
        emitLoadSettings();
        break;
      }

      case 'save_setting': {
        console.log(`sp.prefs[${message.name}] = `, message.value);
        // NOTE: We don't need this as long as we don't incrementally update the settings UI.
        // Need a way to address pref selection in UI, e.g.
        // label.radio input[name="sdk.console.logLevel"][value="off"]
        // This works:
        // document.querySelector('.menulist[name*="sdk"]').value = "error"
        // document.querySelector('label.radio input[name="sdk.console.logLevel"][value="all"]').checked = true;
        // emitLoadSettings();
        break;
      }
        
      default: {
        console.log('bg handleMessages defaults');
        return false;
      }
        
      }
      sendResponse ('bg handleMessages ' + message.type);
    }
    
    browser.runtime.onMessage.addListener(handleMessages);
    browser.runtime.onMessage.addListener(handleMessages2);
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
    // self.port.emit('request_feedback');
    // exports.PigeonDispatcher = PigeonDispatcher;
  }
  catch (exception) {
    // DEBUG_ADDON &&
    // console.error(new Error());
    // DEBUG_ADDON &&
    // reportError(exception);
    DEBUG_ADDON && console.log(exception);
    // DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
})();
