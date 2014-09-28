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
    var showKnowSitesExtensions = function(def) {
      let div = document.createElement('div');
      let ta = document.createElement('textarea');
      ta.style.display = 'block';
      let save = document.createElement('input');
      let cancel = document.createElement('input');
      save.value = "Save";
      save.type = "button";
      cancel.value = "Cancel";
      cancel.type = "button";
      save.addEventListener('click', function (event) {
        self.postMessage({ save: ta.value });
        cancel.click();
      }, false);
      cancel.addEventListener('click', function (event) {
        document.body.removeChild(div);
      }, false);
      div.style.top = '1em';
      div.style.left = '1em';
      div.style.position = 'fixed';
      if (def) {
        ta.value = def;
      }
      //       else {
      //         let ph = {};
      //         ph[Object.keys(PigeonDispatcher.knownOrigins)[0]]
      //         = PigeonDispatcher.knownOrigins[Object.keys(PigeonDispatcher.knownOrigins)[0]];
      //         ta.placeholder = JSON.stringify(ph, null, 2);
      //       }
      div.appendChild(save);
      div.appendChild(cancel);
      div.appendChild(ta);
      document.body.appendChild(div);
    };
    // Handle Android menu entry click using nativewindow.js
    if (typeof self !== 'undefined' && self.port) {
      DEBUG_ADDON &&
        console.log("self.port is true", self);
      self.port.on("show", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.port.on show", self, node, data);
        showKnowSitesExtensions(data);
      });
    }
    // Standard add-on SDK menu entry click handling
    if (typeof self !== 'undefined' && self.on) {
      DEBUG_ADDON &&
        console.log("self is true", self);
      self.on("click", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.on click", self, node, data);
        showKnowSitesExtensions(data);
      });
    }
    exports.showKnowSitesExtensions = showKnowSitesExtensions;
  }
  catch (exception) {
    // DEBUG_ADDON &&
    // console.error(new Error());
    // DEBUG_ADDON &&
    console.error(exception);
  }
})();
