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
(function() {
  const DEBUG_ADDON = false;
  try {
    // NOTE Change Function Scope variable DEBUG_ADDON from false to
    // true in the debugger variables panel before continuing to get
    // console messages logged.
    let _ = (key) => {
      return browser.i18n.getMessage(key);
    };
    const manifest = browser.runtime.getManifest();
    let data = {
      'icon': manifest.icons["48"],
      'menu': {
        'fly': _('fly_menu_entry'),
        'help': _('help_menu_entry'),
        'settings': _('settings_menu_entry')
      }
    };

    function handleMessages(message, sender, sendResponse) {
      console.log(browser.runtime.id + "cs handleMessages");
      console.log("cs handleMessages gets", message, sender, sendResponse);
      switch (message.type) {
        
      case 'open': {
        window.open(message.url, message.name, message.features);
        break;
      }
        
      default: {
        console.log('cs handleMessages defaults');
        return false;
      }
        
      }
      sendResponse ('cs handleMessages ' + message.type);
    }
    
    browser.runtime.onMessage.addListener(handleMessages);
    let div = window.setupIcon('show_feedback', 'request_position_save', data);
    let menu = window.setupMenu(div, data);
    window.setupMenuItem(menu, 'fly', data.menu.fly, function (event) {
      console.log("selection", window.getSelection().toString());
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
      let mailtos = [
      ];
      // TODO Please see
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-substrings
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (value) {
        mailtos.push(value.href);
      });
      let gpluses = [
      ];
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="https://plus.google.com/"]'), function (value) {
        gpluses.push(value.href);
      });
      let meta = [];
      Array.prototype.forEach.call(document.querySelectorAll('meta[name]'), node => {
        meta[node.name] = node.content;
      });
      let message = {
        type: 'fly_safely',
        // document.location has methods too, like 'assign'
        location: {
          href: document.location.href,
          origin: document.location.origin,
          pathname: document.location.pathname
        },
        selection: window.getSelection().toString(),
        rangeLinks: extractLinksFromSelection(),
        meta: meta,
        mailtos: mailtos,
        gpluses: gpluses
      };
      browser.runtime.sendMessage(message).then(res => {
        console.log(res);
      });
    });
    window.setupMenuItem(menu, 'help', data.menu.help);
    window.setupMenuItem(menu, 'settings', data.menu.settings);
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
