/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
;
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
// Replace [/\Bof\s*/] With [ of ]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
(function() {
  try {
    // var exports = exports || {};
    let DEBUG_ADDON = false;
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
    var showKnowSitesExtensions = function(def) {
      let div = document.createElement('div');
      let buttonDiv = document.createElement('div');
      let ta = document.createElement('textarea');
      let save = document.createElement('input');
      let cancel = document.createElement('input');
      save.value = "Save";
      save.type = "button";
      cancel.value = "Cancel";
      cancel.type = "button";
      save.addEventListener('click', function (event) {
        try {
          var data = JSON.parse(ta.value);
          // ta.style.backgroundColor = 'mintcream';
          self.postMessage({ save: data });
          cancel.click();
        }
        catch (e) {
          ta.style.backgroundColor = 'mistyrose';
          window.alert(e.message);
        }
      });
      cancel.addEventListener('click', function (event) {
        document.body.removeChild(div);
      });
      let move = document.createElement('span');
      move.style.align = 'right';
      move.innerHTML = "Move &nesear;";
      move.addEventListener('mousemove', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.buttons == 1/* && event.currentTarget === move*/) {
          div.style.top = (event.clientY - event.target.offsetTop - event.target.offsetHeight / 2) + 'px';
          div.style.left = (event.clientX - event.target.offsetLeft - event.target.offsetWidth / 2) + 'px';
        }
      });
      // move.addEventListener('touchstart', function (event) {
      //   // event.preventDefault();
      //   event.stopPropagation();
      // });
      ta.addEventListener('touchmove', function (e) {
        var touchY = e.touches[e.touches.length - 1].clientY;
        var touchX = e.touches[e.touches.length - 1].clientX;
        if ((touchY - div.offsetTop) < div.offsetHeight * 0.9 || (touchX - div.offsetLeft) < div.offsetWidth * 0.9) {
          e.stopPropagation();
          // e.preventDefault();
          div.style.left = (touchX - (((touchX - div.offsetLeft) > div.offsetWidth * 0.5) ? div.offsetWidth * 0.1 : div.offsetWidth * 0.9)) + 'px';
          div.style.top = (touchY - (((touchY - div.offsetTop) > div.offsetHeight * 0.5) ? div.offsetHeight * 0.1 : div.offsetHeight * 0.9)) + 'px';
        }
      });
      div.style = 'top: 40%; left: 20%; position: fixed;';
      // Cannot have both resize and  width: 50%; height: 50%;
      ta.style = 'resize: both;';
      if (def) {
        ta.value = def;
      }
      //       else {
      //         let ph = {};
      //         ph[Object.keys(PigeonDispatcher.knownOrigins)[0]]
      //         = PigeonDispatcher.knownOrigins[Object.keys(PigeonDispatcher.knownOrigins)[0]];
      //         ta.placeholder = JSON.stringify(ph, null, 2);
      //       }
      buttonDiv.appendChild(save);
      buttonDiv.appendChild(cancel);
      // buttonDiv.appendChild(move);
      div.appendChild(buttonDiv);
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
    DEBUG_ADDON && console.error(exception);
    DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
})();
