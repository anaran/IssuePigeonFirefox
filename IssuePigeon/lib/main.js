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
      worker = tab.attach({
        // let worker = tabs.activeTab.attach({
        // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
        contentScriptFile: [
          './reportFeedbackInformation.js',
          './extendKnownSites.js'
        ],
        contentScriptOptions: {
          self: self,
          metadata: metadata
        },
        // Works with cs self.postMessage, but not with self.port.emit.
        // onMessage: handleMessages,
        onError: handleErrors
      });
      // worker.port.on('error', function (data) {
      //   handleErrors(data);
      // });
      worker.port.on('help', function (data) {
        var originallyActiveTab = tabs.activeTab;
        tabs.open({
          url: data,
          nNewWindow: false,
          // inBackground: true,
          onClose: function() {
            originallyActiveTab.activate();
          }});
      });
      worker.port.on('save', function (data) {
        saveKnownSitesExtensions(data);
      });
      worker.port.on('settings', function (data) {
        tabs.open({
          // inNewWindow: true,
          url: './settings.html',
          onReady: function(tab) {
            // handleErrors(tab);
            let worker = tab.attach({
              // let worker = tabs.activeTab.attach({
              // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
              contentScriptFile: [
                './settings.js'
              ],
              // contentScriptOptions: {
              //   self: self,
              //   metadata: metadata
              // },
              // Works with cs self.postMessage, but not with self.port.emit.
              // onMessage: handleMessages,
              onError: handleErrors
            });
            worker.port.on('request_settings', function (data) {
              worker.port.emit('load_settings', {
                metadata: metadata,
                prefs: sp.prefs
              });
            });
          },
          onClose: function() {
            tabs.activeTab.activate();
          }});
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
          'position': sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {},
          'known': ko.knownOrigins,
          'extensions': sp.prefs['KNOWN_SITES_EXTENSIONS']
        });
      });
      worker.port.on('request_options', function (data) {
        worker.port.emit('show_options', {
          'known': ko.knownOrigins,
          'extensions': sp.prefs['KNOWN_SITES_EXTENSIONS']
        });
      });
      worker.port.on('request_position_save', function (data) {
        sp.prefs['position'] = JSON.stringify(data);
      });
      // };
    });
    // Handle Android menu entry click using nativewindow.js
    // recent is null in Thunderbird 38.0b1
    // if (recent && recent.NativeWindow) {
    //   let nw = require('./nativewindow');
    //   nw.addContextMenu({
    //     name: myTitle,
    //     context: nw.SelectorContext('a'),
    //     callback: function(target) {
    //       let worker = tabs.activeTab.attach({
    //         // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
    //         contentScriptFile: './reportFeedbackInformation.js',
    //         onMessage: reportUnsupportedSite
    //         // TODO Implement this as clickable issue reporting notification
    //         // onError:
    //       });
    //     }});
    //   nw.addContextMenu({
    //     name: 'Extend ' + myTitle,
    //     context: nw.SelectorContext('a'),
    //     callback: function(target) {
    //       let worker = tabs.activeTab.attach({
    //         // contentScriptFile: self.data.url('extendKnownSites.js'),
    //         contentScriptFile: './extendKnownSites.js',
    //         onMessage: handleMessages
    //       });
    //       worker.port.emit('show', originPayload);
    //     }});
    // }
    // // Standard add-on SDK menu entry click handling
    // else {
    //   let cm = require("sdk/context-menu");
    //   pigeonMenuItem = cm.Item({
    //     label: myTitle,
    //     context: cm.URLContext("*"),
    //     // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
    //     contentScriptFile: './reportFeedbackInformation.js',
    //     // data property needs to be kept in sync with KNOWN_SITES_EXTENSIONS preference.
    //     // It seems to be the only way to pass data from the Add-on script to the content-script for a specific menu item.
    //     data: originPayload,
    //     onMessage: reportUnsupportedSite
    //   });
    //   extendMenuItem = cm.Item({
    //     label: 'Extend ' + myTitle,
    //     context: cm.URLContext("*"),
    //     // contentScript: 'console.log("Extend clicked");',
    //     // contentScriptFile: self.data.url('extendKnownSites.js'),
    //     contentScriptFile: './extendKnownSites.js',
    //     // data property needs to be kept in sync with KNOWN_SITES_EXTENSIONS preference.
    //     // It seems to be the only way to pass data from the Add-on script to the content-script for a specific menu item.
    //     data: originPayload,
    //     onMessage: handleMessages
    //   });
    // }
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
