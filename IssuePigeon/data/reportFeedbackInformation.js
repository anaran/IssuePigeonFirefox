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
// Firefox Webextension Background Script.
(function() {
  const DEBUG_ADDON = false;
  DEBUG_ADDON && console.log(new Error('just kidding'));
  try {
    // NOTE Set "DEBUG_ADDON = true" in the debugger before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    let _ = (key) => {
      return browser.i18n.getMessage(key);
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
      const manifest = browser.runtime.getManifest();
      let title = 'Cannot fly home';
      // Leading space gets removed from instructions before use.
      let instructions = `
          <!-- Please describe: -->

# What did you do?

        <!-- 1. steps to reproduce -->

# What happened?

        <!-- actual results -->

# What should have happened?

        <!-- expected results -->

# What Issue Pigeon knows already:
      
        <!-- Please review text below for any private data you may want to remove before submitting (like this comment) -->
        
      `;
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
            browser.notifications.clear('notifyUnsupported');
            browser.notifications.create('notifyUnsupported', {
              "type": "basic",
              "iconUrl": browser.extension.getURL(manifest.icons["48"]),
              "title": `Report ${manifest.name} Github Project`,
              "message": `Cannot match github project at ${aLocation.href}\n` + JSON.stringify({
                aLocation: aLocation,
                match: match,
                options: options
              }, null, 2)
            });
            // let searchParams = new URLSearchParams();
            // searchParams.set("title", `${title} in ${manifest.version}`);
            // searchParams.set("body", instructions.replace(/^\s+/mg, '')
            //                  + JSON.stringify({
            //                    aLocation: aLocation,
            //                    match: match,
            //                    options: options
            //                  }, null, 2));
            // let listener = function(notificationId) {
            //   switch (notificationId) {
            //   case 'notifyUnsupported': {
            //     openWindow ('https://github.com/anaran/IssuePigeonFirefox/issues/new?'
            //                 + searchParams, '_blank', strWindowFeatures);
            //     break;
            //   }
            //   }
            //   browser.notifications.onClicked.removeListener(listener);
            // };
            // browser.notifications.onClicked.addListener(listener);
            // return;
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
    let openWindow = (url, name, features) => {
      browser.tabs.query({
        currentWindow: true,
        active: true
      }).then(tabs => {
        DEBUG_ADDON && console.log('openWindow', tabs, tabs[0].id);
        browser.tabs.sendMessage(tabs[0].id, {
          type: 'open',
          url: url,
          name: name,
          features: features
        }).then(res => {
          DEBUG_ADDON && console.log(res); 
        }).catch(err => {
          DEBUG_ADDON && console.log(err);
        });
      });
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
    bugzilla.prototype.fly = function (data) {
      this.help && openWindow(this.help, '_blank', strWindowFeatures);
      var link = this.report && this.report + '&comment='
          + window.encodeURIComponent((data.rangeLinks.length ? 'See these links:\n\n'
                                       + data.rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + data.location.href + '\n\nDetails:\n\n' + data.selection + '\n\nhttp://mzl.la/1vxCDgA\n\n')
          + '&bug_file_loc=' + window.encodeURIComponent(data.location.href)
          + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON && console.log(this, link);
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
        setTimeout(function () {
          let ta = win.document.querySelector('textarea#wpTextbox1.mw-ui-input');
          if (ta) {
            ta.value = addition + ta.value;
          }
        }, 3000);
      }
      return true;
    };
    var reportFeedbackInformation = function (message) {
      // message.location = 'location' in message ? message.location : aTestLocation;
      try {
        PigeonDispatcher.knownOrigins = window.knownOrigins;
        PigeonDispatcher.rangeLinks = message.rangeLinks;
        PigeonDispatcher.selection = message.selection;
        if ('extensions' in message) {
          let additionalSites = JSON.parse(message.extensions);
          Object.keys(additionalSites).forEach(function (key) {
            if (PigeonDispatcher.knownOrigins.hasOwnProperty(key)) {
              DEBUG_ADDON && console.warn('user overrides definition for',  key);
            }
            PigeonDispatcher.knownOrigins[key] = additionalSites[key];
          });
        }
      } catch (exception) {
        DEBUG_ADDON && console.error(exception);
      }

      var handler = PigeonDispatcher.knownOrigins[message.location.origin]
          || PigeonDispatcher.knownOrigins[
            message.location.origin
              + message.location.pathname.split("/", 2).join("/")];
      if (handler && handler.type) {
        let constr = constructors[handler.type];
        let derived = function DerivedReporter() {
          constr.call(this, message.location, handler);
        };
        derived.prototype = Object.create(constr.prototype);
        derived.prototype.constructor = derived;
        if ((new derived()).fly(message)) {
          // FIXME: this is in fact supported, should not raise a notification!
        }
        else {
          // NOTE: something went wrong for a supported site.
          browser.notifications.clear('notifyUnsupported');
          browser.notifications.create('notifyUnsupported', {
            "type": "basic",
            "iconUrl": browser.extension.getURL(manifest.icons["48"]),
            "title": `Report ${manifest.name} Supported Site`,
            "message": `Cannot fly from supported site ${message.location.href}\n\nClick to create issue if this use case should be supported in a future version.\n` + JSON.stringify(message, null, 2)
          });
          let searchParams = new URLSearchParams();
          searchParams.set("title", `${title} in ${manifest.version}`);
          searchParams.set("body", instructions.replace(/^\s+/mg, '')
                           + JSON.stringify(message, null, 2));
          let listener = function(notificationId) {
            switch (notificationId) {
            case 'notifyUnsupported': {
              openWindow ('https://github.com/anaran/IssuePigeonFirefox/issues/new?'
                          + searchParams, '_blank', strWindowFeatures);
              break;
            }
            }
            browser.notifications.onClicked.removeListener(listener);
          };
          browser.notifications.onClicked.addListener(listener);
        }
        // return aTestLocation;
      }
      else {
        // This site is indeed not supported. Report it to possibly get support.
        browser.notifications.clear('notifyUnsupported');
        browser.notifications.create('notifyUnsupported', {
          "type": "basic",
          "iconUrl": browser.extension.getURL(manifest.icons["48"]),
          "title": `Report ${manifest.name} Unsupported Site`,
          "message": `Cannot fly from unsupported site ${message.location.href}\n\nClick to create issue if this site should be supported in a future version.\n` + JSON.stringify(message, null, 2)
        });
        let searchParams = new URLSearchParams();
        searchParams.set("title", `${title} in ${manifest.version}`);
        searchParams.set("body", instructions.replace(/^\s+/mg, '')
                         + JSON.stringify(message, null, 2));
        let listener = function(notificationId) {
          switch (notificationId) {
          case 'notifyUnsupported': {
            openWindow ('https://github.com/anaran/IssuePigeonFirefox/issues/new?'
                        + searchParams, '_blank', strWindowFeatures);
            break;
          }
          }
          browser.notifications.onClicked.removeListener(listener);
        };
        browser.notifications.onClicked.addListener(listener);
      }
    };

    function handleMessages(message, sender, sendResponse) {
      DEBUG_ADDON && console.log(browser.runtime.id + " bg handleMessages");
      DEBUG_ADDON && console.log("bg handleMessages gets", message, sender, sendResponse);
      switch (message.type) {

      case 'fly_safely': {
        browser.storage.local.get('JSON_KNOWN_SITES_EXTENSIONS').then(res => {
          if (res) {
            message.extensions = res['JSON_KNOWN_SITES_EXTENSIONS'];
          }
          reportFeedbackInformation(message);
        });
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
                  DEBUG_ADDON && console.log (changeInfo.status, tabInfo);
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
              DEBUG_ADDON && console.log('browser.tabs.create', tabs);
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
                  DEBUG_ADDON && console.log (changeInfo.status, tabInfo);
                  if (changeInfo && (changeInfo.status == 'complete')
                      && (tabInfo.url == settingsURL)) {
                    browser.tabs.executeScript(
                      tabId,
                      {
                        file: "/localize.js"
                      }
                    ).then(() => {
                      // browser.tabs.onUpdated.removeListener(listener);
                    });
                    browser.tabs.executeScript(
                      tabId,
                      {
                        file: "/data/diagnostics_overlay.js"
                      }
                    ).then(() => {
                      // browser.tabs.onUpdated.removeListener(listener);
                    });
                    browser.tabs.executeScript(
                      tabId,
                      {
                        file: "/data/report-json-parse-error.js"
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
              DEBUG_ADDON && console.log('browser.tabs.create', tabs);
            });
          }
        });
        break;
      }

      default: {
        DEBUG_ADDON && console.log('bg handleMessages defaults, returns true');
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
    browser.runtime.onMessage.addListener(handleMessages);
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
    // console.error(new Error());
    // DEBUG_ADDON &&
    // reportError(exception);
    DEBUG_ADDON && console.log(exception);
    // DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
})();
