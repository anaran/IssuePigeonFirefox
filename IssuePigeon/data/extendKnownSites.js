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
    var showKnownSitesExtensions = function(def) {
      let div = document.createElement('div');
      let buttonDiv = document.createElement('div');
      let taExtensions = document.createElement('textarea');
      let taKnown = document.createElement('textarea');
      let save = document.createElement('input');
      let cancel = document.createElement('input');
      let help = document.createElement('a');
      save.value = "Save";
      save.type = "button";
      cancel.value = "Cancel";
      cancel.type = "button";
      help.textContent = 'Help';
      var renderHtmlFile = function (path) {
        self.postMessage({ help: path });
      };
      help.onclick = function (event) {
        renderHtmlFile('../html/HELP.html');
      };
      save.addEventListener('click', function (event) {
        try {
          var data = JSON.parse(taExtensions.value);
          taExtensions.value = JSON.stringify(data, null, 2);
          // taExtensions.style.backgroundColor = 'mintcream';
          self.postMessage({ save: taExtensions.value });
          cancel.click();
        }
        catch (e) {
          taExtensions.style.backgroundColor = 'mistyrose';
          window.alert(e.message);
        }
      });
      cancel.addEventListener('click', function (event) {
        document.body.removeChild(div);
      });
      taExtensions.addEventListener('mousemove', function (e) {
        if ((e.clientX - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (e.clientX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
          e.stopPropagation();
          e.preventDefault();
          if (e.buttons == 1/* && e.currentTarget === move*/) {
            div.style.left = (e.clientX - (((e.clientX - div.offsetLeft) > div.offsetWidth * 0.5) ? div.offsetWidth * 0.8 : div.offsetWidth * 0.2)) + 'px';
            div.style.top = (e.clientY - (((e.clientY - div.offsetTop) > div.offsetHeight * 0.5) ? div.offsetHeight * 0.8 : div.offsetHeight * 0.2)) + 'px';
          }
        }
      });
      taExtensions.addEventListener('touchmove', function (e) {
        var touchY = e.touches[e.touches.length - 1].clientY;
        var touchX = e.touches[e.touches.length - 1].clientX;
        if ((touchY - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (touchX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
          e.stopPropagation();
          e.preventDefault();
          div.style.left = (touchX - (((touchX - div.offsetLeft) > div.offsetWidth * 0.5) ? div.offsetWidth * 0.8 : div.offsetWidth * 0.2)) + 'px';
          div.style.top = (touchY - (((touchY - div.offsetTop) > div.offsetHeight * 0.5) ? div.offsetHeight * 0.8 : div.offsetHeight * 0.2)) + 'px';
        }
      });
      div.style = 'top: 40%; left: 20%; position: fixed;';
      // Cannot have both resize and define width: 50%; height: 50%;
      taExtensions.style = 'resize: both;';
      let pd = JSON.parse(def);
      if (pd.extensions) {
        taExtensions.value = pd.extensions;
      }
      if (pd.known) {
        taKnown.value = JSON.stringify(pd.known, null, 2);
      }
      taKnown.style = 'resize: both;';
      taKnown.readOnly = true;
      buttonDiv.appendChild(save);
      buttonDiv.appendChild(cancel);
      buttonDiv.appendChild(help);
      div.appendChild(buttonDiv);
      div.appendChild(taExtensions);
      div.appendChild(taKnown);
      document.body.appendChild(div);
    };
    // Handle Android menu entry click using nativewindow.js
    if (typeof self !== 'undefined' && self.port) {
      DEBUG_ADDON &&
        console.log("self.port is true", self);
      self.port.on("show", function (data) {
        DEBUG_ADDON &&
          console.log("self.port.on show", self, data);
        showKnownSitesExtensions(data);
      });
    }
    // Standard add-on SDK menu entry click handling
    if (typeof self !== 'undefined' && self.on) {
      DEBUG_ADDON &&
        console.log("self is true", self);
      self.on("click", function (node, data) {
        DEBUG_ADDON &&
          console.log("self.on click", self, node, data);
        showKnownSitesExtensions(data);
      });
    }
    exports.showKnownSitesExtensions = showKnownSitesExtensions;
  }
  catch (exception) {
    DEBUG_ADDON && console.error(exception);
    DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
})();
