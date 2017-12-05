'use strict';
/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
//
// Replace [/\b(const|let)\B/] with [$1 ]
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
//
// Author: adrian.aichner@gmail.com
//
// (function() {
let DEBUG_ADDON = true;
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
  // const lo = require("@loader/options");
  // DEBUG_ADDON &&
  //   console.dir(lo);
  // const jpm = lo && lo.metadata.title;
  // DEBUG_ADDON &&
  //   console.log("jpm", jpm);
  // DEBUG_ADDON &&
  //   console.log('Logging enabled via debugger');
  // const ko = require('./data/known-origins.js');
  // const self = require('sdk/self');
  // // Only available for options natively supported by firefox, i.e. in jpm.
  // const metadata = lo.metadata;
  // const ps = require("sdk/preferences/service");
  // if (!lo || !lo.metadata.title) {
  //   ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.baseURI');
  //   ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.rootURI');
  //   ps.reset('extensions.issue-pigeon@addons.mozilla.org.sdk.version');
  // }
  // const myTitle = self.title || metadata.title || self.name;
  // let loading =
  //     'addon ' + myTitle + ' ' + self.version + ' $Format:%h%d$ loads ' +
  //     // NOTE: Introduce fragment specifier before line spec to make
  //     // clickable link work in console.log.
  //     (new Error).stack.replace(/:(\d+):(\d+)/g, '#L$1C$2');
  // DEBUG_ADDON &&
  //   console.log(loading);
  // if (console.time) {
  //   DEBUG_ADDON &&
  //     console.time('load time');
  // }
  // if (console.profile) {
  //   DEBUG_ADDON &&
  //     console.log('start profiling');
  //   DEBUG_ADDON &&
  //     console.profile('addon ' + self.name + ' ' + self.version + 'profile');
  // }
  // 
  // // to see how to test this function, look at ./test/test-main.js
  // var testSelfProperty = function(property, callback) {
  //   callback(self[property]);
  // };
  // 
  // var dummy = function(callback) {
  //   let { metadata } = require("@loader/options");
  //   // let { metadata } = require("sdk/self");
  //   callback(metadata);
  // };
  // 
  // exports.dummy = dummy;
  // exports.testSelfProperty = testSelfProperty;
  // 
  // const notifications = require("sdk/notifications");
  // const qs = require("sdk/querystring");
  // const tabs = require("sdk/tabs");
  // var _ = require("sdk/l10n").get;
  let _ = (key) => {
    // return key;
    return browser.i18n.getMessage(key);
  };
  // let settingsTab, helpTab;
  // let sp = require('sdk/simple-prefs');
  // // extensions.issue-pigeon@addons.mozilla.org.KNOWN_SITES_EXTENSIONS;{}
  // if (ps.isSet('extensions.issue-pigeon@addons.mozilla.org.KNOWN_SITES_EXTENSIONS')) {
  //   sp.prefs['JSON_KNOWN_SITES_EXTENSIONS'] = sp.prefs['KNOWN_SITES_EXTENSIONS'];
  //   let title = self.name + ': Migration of preference KNOWN_SITES_EXTENSIONS';
  //   let text = "\nPreference KNOWN_SITES_EXTENSIONS has been migrated to JSON_KNOWN_SITES_EXTENSIONS.";
  //   text += "\nThe former will be reset.\n\nKNOWN_SITES_EXTENSIONS = " + sp.prefs['KNOWN_SITES_EXTENSIONS']
  //   notifications.notify({
  //     title: title,
  //     text: text,
  //     data: qs.stringify({
  //       title:
  //       title + ' in ' + self.version,
  //       body:
  //       "(Please review for any private data you may want to remove before submitting)\n\n" + text
  //     }),
  //     onClick: function (data) {
  //       tabs.open({
  //         inNewWindow: true,
  //         url: 'https://github.com/anaran/IssuePigeonFirefox/issues/new?' + data,
  //         onClose: function() {
  //           require("sdk/tabs").activeTab.activate();
  //         }});
  //     }});
  //   ps.reset('extensions.issue-pigeon@addons.mozilla.org.KNOWN_SITES_EXTENSIONS');
  // }
  // The real one is in reportFeedbackInformation.js
  // {
  var manifest = browser.runtime.getManifest();
  let data = {
    'icon': manifest.icons["48"],
    'menu': {
      'fly': _('fly_menu_entry'),
      'help': _('help_menu_entry'),
      'settings': _('settings_menu_entry')
    },
    // 'position': sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {}
  };
    function handleMessages(message, sender, sendResponse) {
      console.log(chrome.runtime.id + "cs handleMessages");
      console.log("cs handleMessages gets", message, sender, sendResponse);
      switch (message.type) {
        
      case 'open': {
        window.open(message.url, message.name, message.features);
        break;
      }

      default:
        console.log('cs handleMessages defaults');
        
      }
      sendResponse ('cs handleMessages ' + message.type);
    }
    
  browser.runtime.onMessage.addListener(handleMessages);
  let div = window.setupIcon('show_feedback', 'request_position_save', data);
  let menu = window.setupMenu(div, data);
  window.setupMenuItem(menu, 'fly', data.menu.fly, function (event) {
    console.log("selection", window.getSelection().toString());
    event.preventDefault();
    event.stopPropagation();
    let extractLinksFromSelection = () => {
      let s = typeof window !== 'undefined' && window.getSelection();
      let rangeLinks = {
      };
      if (s) {
        for (let i = 0; i < s.rangeCount; i++) {
          let rc = s.getRangeAt(i).cloneContents();
          rc.querySelectorAll
            && Array.prototype.forEach.call(rc.querySelectorAll('a[href]'), (value) => {
              rangeLinks[value.href] = true;
            });
        }
      }
      return Object.keys(rangeLinks);
    };
    let message = {
      type: 'fly_safely',
      // document.location has methods too, like 'assign'
      // location: JSON.stringify(document.location),
      location: {
        href: document.location.href,
        origin: document.location.origin,
        pathname: document.location.pathname
      },
      // location: document.location,
      selection: window.getSelection().toString(),
      rangeLinks: extractLinksFromSelection()
      // extensions: sp.prefs['JSON_KNOWN_SITES_EXTENSIONS'],
      // known: ko.knownOrigins
    };
    browser.runtime.sendMessage(message).then(res => {
      console.log(res);
    });
    // self.port.on('fly_safely', function(data) {
    //   reportFeedbackInformation(data);
    // });
    // NOTE: Now we need to get latest site extensions, which
    // might have been changed by user since add-on content
    // script was loaded.
    // browser.runtime.sendMessage({
    // type: 'need_flight_data'});
  });
  window.setupMenuItem(menu, 'help', data.menu.help);
  window.setupMenuItem(menu, 'settings', data.menu.settings);
  // }
  let bugzilla = function () {};
  let sample = JSON.stringify({
    'https://my.own.server:8443': {
      help: 'https://wiki.eclipse.org/Orion',
      report: "https://bugs.eclipse.org/bugs/enter_bug.cgi?product=Orion&component=Client&version=unspecified",
      type: 'bugzilla'
    }
  }, null, 2);
  var saveKnownSitesExtensions = function(data) {
    sp.prefs['JSON_KNOWN_SITES_EXTENSIONS'] = data;
  };
  // sp.on('JSON_KNOWN_SITES_EXTENSIONS', function(prefName) {
  //   DEBUG_ADDON &&
  //     console.log('Setting ' + prefName + ' for ' + self.name + ' version ' +
  //                 self.version + ' to ' + sp.prefs[prefName]);
  // });
  let handleErrors = function (exception) {
    // FIXME: Perhaps this should open a styled error page and just
    // post error data to it.
    if (false) {
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
    }
    else {
      console.error((JSON.stringify(exception,
                                    Object.getOwnPropertyNames(exception), 2)));
    }
  };

  // let worker, originPayload = JSON.stringify({ 'known': ko.knownOrigins, 'extensions': sp.prefs['JSON_KNOWN_SITES_EXTENSIONS'] }, null, 2);
  // tabs.on('ready', function(tab) {
  //   let setupWorkers = function() {
  //     worker = tab.attach({
  //       // let worker = tabs.activeTab.attach({
  //       // contentScriptFile: self.data.url('reportFeedbackInformation.js'),
  //       contentScriptFile: [
  //         './anaran-jetpack-content/setup_icon.js',
  //         './anaran-jetpack-content/setup_menu_item.js',
  //         './reportFeedbackInformation.js',
  //         './diagnostics_overlay.js'
  //       ],
  //       onError: handleErrors
  //     });
  //     worker.port.emit('updateIconPosition', {
  //       position: sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {}
  //     });
  //     worker.port.on('help', function (data) {
  //       // handleErrors({'settings_title': _('settings_title')});
  //       let originallyActiveTab = tabs.activeTab;
  //       if (helpTab) {
  //         helpTab.activate();
  //         helpTab.on('close', function() {
  //           helpTab = false;
  //           for (let t of tabs) {
  //             if (t === originallyActiveTab) {
  //               originallyActiveTab.activate();
  //               break;
  //             }
  //           }
  //         });
  //       }
  //       else {
  //         tabs.open({
  //           url: self.data.url(_('help_path')),
  //           onReady: function(tab) {
  //             helpTab = tab;
  //           },
  //           onClose: function() {
  //             helpTab = false;
  //             for (let t of tabs) {
  //               if (t === originallyActiveTab) {
  //                 originallyActiveTab.activate();
  //                 break;
  //               }
  //             }
  //           }
  //         });
  //       }
  //     });
  //     worker.port.on('save', function (data) {
  //       saveKnownSitesExtensions(data);
  //     });
  //     worker.port.on('settings', function (data) {
  //       let originallyActiveTab = tabs.activeTab;
  //       let settingsWorker;
  //       if (settingsTab) {
  //         if (settingsTab.url == self.data.url(data.url)) {
  //           settingsTab.activate();
  //         }
  //         else {
  //           // Need to reload URL, e.g. after Help link was clicked in Settings tab.
  //           settingsTab.url = self.data.url(data.url);
  //         }
  //         settingsTab.on('close', function() {
  //           settingsTab = false;
  //           for (let t of tabs) {
  //             if (t === originallyActiveTab) {
  //               originallyActiveTab.activate();
  //               break;
  //             }
  //           }
  //         });
  //       }
  //       else {
  //         tabs.open({
  //           // inNewWindow: true,
  //           url: data.url,
  //           onReady: function(tab) {
  //             // console.log('tab.url', tab.url, settingsTab.url, originallyActiveTab.url);
  //           },
  //           onClose: function() {
  //             settingsTab = false;
  //             // NOTE: See https://bugzilla.mozilla.org/show_bug.cgi?id=1208499
  //             // let me = originallyActiveTab.index;
  //             for (let t of tabs) {
  //               if (t === originallyActiveTab) {
  //                 originallyActiveTab.activate();
  //                 break;
  //               }
  //             }
  //           }});
  //       }
  //     });
  //     worker.port.on('unsupported', function (data) {
  //       let title = data.title || 'Cannot fly home';
  //       notifications.notify({
  //         title: self.name + ': ' + title,
  //         text: "\nClick to report this\n" + JSON.stringify(data, null, 2),
  //         data: qs.stringify({
  //           title:
  //           title + ' in ' + self.version,
  //           body:
  //           "(Please review for any private data you may want to remove before submitting)\n\n" + JSON.stringify(data, null, 2)
  //         }),
  //         onClick: function (data) {
  //           tabs.open({
  //             inNewWindow: true,
  //             url: 'https://github.com/anaran/IssuePigeonFirefox/issues/new?' + data,
  //             onClose: function() {
  //               require("sdk/tabs").activeTab.activate();
  //             }});
  //         }});
  //     });
  //     worker.port.on('request_feedback', function (data) {
  //       worker.port.emit('show_feedback', {
  //         'icon': metadata.icon,
  //         'menu': {
  //           'fly': _('fly_menu_entry'),
  //           'help': _('help_menu_entry'),
  //           'settings': _('settings_menu_entry')
  //         },
  //         'position': sp.prefs['position'] && JSON.parse(sp.prefs['position']) || {}
  //       });
  //     });
  //     worker.port.on('need_flight_data', function (data) {
  //     });
  //     worker.port.on('request_options', function (data) {
  //       worker.port.emit('show_options', {
  //         'known': ko.knownOrigins,
  //         'extensions': sp.prefs['JSON_KNOWN_SITES_EXTENSIONS']
  //       });
  //     });
  //     worker.port.on('request_position_save', function (data) {
  //       sp.prefs['position'] = JSON.stringify(data);
  //     });
  //   };
  //   switch (sp.prefs['loading']) {
  //   case "delayed":
  //     tab.on('activate', function(tab) {
  //       setupWorkers();
  //     });
  //     break;
  //   case "immediate":
  //     setupWorkers();
  //     break;
  //   case "disabled":
  //     break;
  //   }
  // });
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
// })();
