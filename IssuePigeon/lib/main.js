/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
;
'use strict';
//
// Replace [/\b(const|let)\B/] with [$1 ]
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
//
// Author: adrian.aichner@gmail.com
//
(function() {
  let DEBUG_ADDON = false;
  try {
    // var exports = exports || {};
    //
    // NOTE Change Function Scope variable DEBUG_ADDON from false to true in the debugger variables panel before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    if (DEBUG_ADDON) {
      // debugger is statement, not expression.
      // DEBUG_ADDON && debugger;
      // causes exception.
      // debugger;
    }
    const lo = require("@loader/options");
    DEBUG_ADDON &&
      console.dir(lo);
    const jpm = lo && lo.metadata.title;
    DEBUG_ADDON &&
      console.log("jpm", jpm);
    DEBUG_ADDON &&
      console.log('Logging enabled via debugger');
    const koPath = jpm ? '../data/known-origins.js' : 'data/known-origins.js';
    const ko = require(koPath);
    const myCrPath = '../data/my-utils.js';
    // const myu = require(myCrPath);
    const self = require('sdk/self');
    // Only available for options natively supported by firefox, i.e. in jpm.
    const metadata = lo.metadata;
    if (!lo || !lo.metadata.title) {
      let ps = require("sdk/preferences/service");
      ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.baseURI');
      ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.rootURI');
      ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.version');
    }
    const myTitle = self.title || metadata.title || self.name;
    let loading =
        'addon ' + myTitle + ' ' + self.version + ' $Format:%h%d$ loads ' +
        // NOTE: Introduce fragment specifier before line spec to make
        // clickable link work in console.log.
        (new Error).stack.replace(/:(\d+):(\d+)/g, '#L$1C$2');
    DEBUG_ADDON &&
      console.log(loading);
    if (console.time) {
      DEBUG_ADDON &&
        console.time('load time');
    }
    if (console.profile) {
      DEBUG_ADDON &&
        console.log('start profiling');
      DEBUG_ADDON &&
        console.profile('addon ' + self.name + ' ' + self.version + 'profile');
    }

    // to see how to test this function, look at ../test/test-main.js
    var testSelfProperty = function(property, callback) {
      callback(self[property]);
    };

    var dummy = function(callback) {
      let { metadata } = require("@loader/options");
      // let { metadata } = require("sdk/self");
      callback(metadata);
    };

    exports.dummy = dummy;
    exports.testSelfProperty = testSelfProperty;

    // See https://blog.mozilla.org/addons/2013/06/13/jetpack-fennec-and-nativewindow
    // get a global window reference
    const utils = require('sdk/window/utils');
    const recent = utils.getMostRecentBrowserWindow();
    const notifications = require("sdk/notifications");
    const qs = require("sdk/querystring");
    const tabs = require("sdk/tabs");
    var _ = require("sdk/l10n").get;
    // const ll = require("sdk/l10n/locale");
    let settingsTab, helpTab;
    let sp = require('sdk/simple-prefs');
    sp.prefs['sdk.console.logLevel'] = 'info';
    // The real one is in reportFeedbackInformation.js
    let bugzilla = function () {};
    let sample = JSON.stringify({
      'https://my.own.server:8443': {
        help: 'https://wiki.eclipse.org/Orion',
        report: "https://bugs.eclipse.org/bugs/enter_bug.cgi?product=Orion&component=Client&version=unspecified",
        type: 'bugzilla'
      }
    }, null, 2);

    // Need to update let extendMenuItem.data from preference.
    let extendMenuItem, pigeonMenuItem;
    var saveKnownSitesExtensions = function(data) {
      sp.prefs['KNOWN_SITES_EXTENSIONS'] = data;
      let originPayload = JSON.stringify({ 'known': ko.knownOrigins, 'extensions': data }, null, 2);
      if (extendMenuItem) {
        extendMenuItem.data = originPayload;
      }
      if (pigeonMenuItem) {
        pigeonMenuItem.data = originPayload;
      }
    };

    sp.on('KNOWN_SITES_EXTENSIONS', function(prefName) {
      DEBUG_ADDON &&
        console.log('Setting ' + prefName + ' for ' + self.name + ' version ' +
                    self.version + ' to ' + sp.prefs[prefName]);
      // Keep menu item data attribute in sync.
      let originPayload = JSON.stringify({ 'known': ko.knownOrigins, 'extensions': sp.prefs[prefName] }, null, 2);
      if (extendMenuItem) {
        extendMenuItem.data = originPayload;
      }
      if (pigeonMenuItem) {
        pigeonMenuItem.data = originPayload;
      }
    });

    let handleErrors = function (exception) {
      // FIXME: Perhaps this should open a styled error page and just post error data to it.
      tabs.open({
        // inNewWindow: true,
        url: 'data:text/html;charset=utf-8,<html><head><title>' + myTitle
        + ' Error</title></head><body><h1>' + myTitle
        + ' Error</h1><pre>'
        + (JSON.stringify(exception,
                          Object.getOwnPropertyNames(exception), 2))
        .replace(/(:\d+)+/g, '$&\n')
        .replace(/->/g, '\n$&')
        .replace(/\n/g, '%0a')
        + '</pre>',
        onClose: function() {
          tabs.activeTab.activate();
        }});
    };

    let worker, originPayload = JSON.stringify({ 'known': ko.knownOrigins, 'extensions': sp.prefs['KNOWN_SITES_EXTENSIONS'] }, null, 2);
    // tabs.activeTab.on('ready', function(tab) {
    tabs.on('ready', function(tab) {
      let setupWorkers = function() {
        worker = tab.attach({
          // let worker = tabs.activeTab.attach({
          // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
          contentScriptFile: [
            /*'./settings.js',*/
            './reportFeedbackInformation.js',
            /*'./report-json-parse-error.js',
          './extendKnownSites.js',*/
            './diagnostics_overlay.js'
          ],
          onError: handleErrors
        });
        // tab.on('activate', function() {
        worker.port.emit('updateIconPosition', {
          position: sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {}
        });
        // });
        worker.port.on('help', function (data) {
          // handleErrors({'settings_title': _('settings_title')});
          let originallyActiveTab = tabs.activeTab;
          if (helpTab) {
            helpTab.activate();
            helpTab.on('close', function() {
              helpTab = false;
              for (let t of tabs) {
                if (t === originallyActiveTab) {
                  originallyActiveTab.activate();
                  break;
                }
              }
            });
          }
          else {
            tabs.open({
              url: data,
              onReady: function(tab) {
                helpTab = tab;
              },
              onClose: function() {
                helpTab = false;
                for (let t of tabs) {
                  if (t === originallyActiveTab) {
                    originallyActiveTab.activate();
                    break;
                  }
                }
              }
            });
          }
        });
        worker.port.on('save', function (data) {
          saveKnownSitesExtensions(data);
        });
        worker.port.on('settings', function (data) {
          let originallyActiveTab = tabs.activeTab;
          let settingsWorker;
          if (settingsTab) {
            settingsTab.activate();
            settingsTab.on('close', function() {
              settingsTab = false;
              for (let t of tabs) {
                if (t === originallyActiveTab) {
                  originallyActiveTab.activate();
                  break;
                }
              }
            });
          }
          else {
            tabs.open({
              // inNewWindow: true,
              url: './settings.html',
              onReady: function(tab) {
                settingsTab = tab;
                settingsWorker = tab.attach({
                  contentScriptFile: [
                    './settings.js',
                    './report-json-parse-error.js',
                    './diagnostics_overlay.js'
                  ],
                  onError: handleErrors
                });
                let localizedPreferences = metadata.preferences.map(function(pref) {
                  pref.title = _(pref.name + '_title');
                  pref.description = _(pref.name + '_description');
                  return pref;
                });
                settingsWorker.port.on('request_settings', function (data) {
                  settingsWorker.port.emit('load_settings', {
                    localizedPreferences: localizedPreferences,
                    prefs: sp.prefs
                  });
                  if (sp.prefs['diagnostics_overlay']) {
                    settingsWorker.port.emit('reportError', {
                      err: sp.prefs,
                      indent: 2
                    });
                  }
                });
                settingsWorker.port.on('save_setting', function (data) {
                  sp.prefs[data.name] = data.value;
                  // Need a way to address pref selection in UI, e.g.
                  // label.radio input[name="sdk.console.logLevel"][value="off"]
                  // This works:
                  // document.querySelector('.menulist[name*="sdk"]').value = "error"
                  // document.querySelector('label.radio input[name="sdk.console.logLevel"][value="all"]').checked = true;
                  settingsWorker.port.emit('load_settings', {
                    localizedPreferences: localizedPreferences,
                    prefs: sp.prefs
                  });
                  if (sp.prefs['diagnostics_overlay']) {
                    settingsWorker.port.emit('reportError', {
                      err: sp.prefs,
                      indent: 2
                    });
                  }
                });
                sp.on('position', function(prefName) {
                  settingsWorker.port.emit('load_settings', {
                    localizedPreferences: localizedPreferences,
                    prefs: sp.prefs
                  });
                  if (sp.prefs['diagnostics_overlay']) {
                    settingsWorker.port.emit('reportError', {
                      err: sp.prefs,
                      indent: 2
                    });
                  }
                });
              },
              onClose: function() {
                settingsTab = false;
                // NOTE: See https://bugzilla.mozilla.org/show_bug.cgi?id=1208499
                // let me = originallyActiveTab.index;
                for (let t of tabs) {
                  if (t === originallyActiveTab) {
                    originallyActiveTab.activate();
                    break;
                  }
                }
              }});
          }
        });
        worker.port.on('unsupported', function (data) {
          let title = self.name + ': Cannot fly home';
          notifications.notify({
            title: title,
            text: "\nClick to report this\n" + data,
            data: qs.stringify({
              title:
              title + ' in ' + self.version,
              body:
              "(Please review for any private data you may want to remove before submitting)\n\n" + data
            }),
            onClick: function (data) {
              tabs.open({
                inNewWindow: true,
                url: 'https://github.com/anaran/IssuePigeonFirefox/issues/new?' + data,
                onClose: function() {
                  require("sdk/tabs").activeTab.activate();
                }});
            }});
        });
        // tab.on('ready', function(tab) {
        //   // }
        // Checking tab.readyState causes CPOW
        // if (tab.readyState == 'complete') {
        worker.port.on('request_feedback', function (data) {
          worker.port.emit('show_feedback', {
            'extensions': sp.prefs['KNOWN_SITES_EXTENSIONS'],
            'icon': metadata.icon,
            'known': ko.knownOrigins,
            'menu': {
              'fly': _('fly_menu_entry'),
              'help': _('help_menu_entry'),
              'settings': _('settings_menu_entry')
            },
            'position': sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {}
          });
        });
        worker.port.on('request_options', function (data) {
          worker.port.emit('show_options', {
            'known': ko.knownOrigins,
            'extensions': sp.prefs['KNOWN_SITES_EXTENSIONS']
          });
        });
        worker.port.on('request_position_save', function (data) {
          // handleErrors(data);
          sp.prefs['position'] = JSON.stringify(data);
        });
        // };
      };
      switch (sp.prefs['loading']) {
        case "delayed":
          tab.on('activate', function(tab) {
            setupWorkers();
          });
          break;
        case "immediate":
          setupWorkers();
          break;
        case "disabled":
          break;
      }
    });
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
    DEBUG_ADDON && console.error(exception);
    DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
    // handleErrors(exception);
  }
})();
