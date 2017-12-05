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
  //  let DEBUG_ADDON = false;
  //  return {
  let showDiagnosticsOverlay = function (data) {
    if (typeof document != 'undefined') {
      var box = document.querySelector('.err-box') || (function() {
        var div = document.body.appendChild(document.createElement('div'));
        var box = div.appendChild(document.createElement('span'));
        box.className = 'err-box';
        box.style.backgroundColor = 'mistyrose';
        box.style.border = '1px dashed';
        box.style.bottom = '2mm';
        box.style.color = 'black';
        box.style.fontSize = 'small';
        box.style.left = '2mm';
        box.style.overflow = 'auto';
        box.style.position = 'fixed';
        box.style.resize = 'none';
        box.style.right = '75%';
        box.style.top = '75%';
        box.addEventListener('click', function (event) {
          // ~Don't cancel default, like text selection or double click.~
          event.preventDefault();
          event.stopPropagation();
          if (box.style.right == '2mm') {
            box.style.right = '75%';
            box.style.top = '75%';
            // close.style.top = '75%';
          }
          else {
            box.style.top = '2mm';
            box.style.right = '2mm';
            // close.style.top = '2mm';
          }
        });
        var close = div.appendChild(document.createElement('span'));
        // close.href = 'Close Overlay';
        close.innerHTML = '&times;';
        close.style.backgroundColor = 'white';
        close.style.fontSize = 'x-large';
        close.style.margin = '0';
        close.style.opacity = '0.5';
        close.style.position = 'fixed';
        close.style.left = '22%';
        close.style.textDecoration = 'none';
        close.style.top = '75%';
        // close.style.left = '0';
        // close.style.bottom = '30%';
        // close.style.position = 'fixed';
        close.addEventListener('click', function (event) {
          event.preventDefault();
          document.body.removeChild(div);
        });
        return box;
      })();
      var entry = document.createElement('pre');
      entry.textContent = (JSON.stringify(data.err, null, data.indent || 0));
      if (box.firstElementChild) {
        box.insertBefore(entry, box.firstElementChild);
      }
      else {
        box.appendChild(entry);
      }
    }
  };

  // function handleMessages(message, sender, sendResponse) {
  //   // message, sender, sendResponse are all <unavailable>|
  //   console.log("cs handleMessages gets", message, sender, sendResponse);
  //   sendResponse({type: "response",
  //       	  sender: sender,
  //       	  original: message});
  //   // return true from the event listener to indicate you wish to
  //   // send a response asynchronously (this will keep the message
  //   // channel open to the other end until sendResponse is called).
  //   // See https://developer.chrome.com/extensions/runtime#event-onMessage
  //   return true;
  // }
  // 
  // chrome.runtime.onMessage.addListener(handleMessages);
  if (typeof window !== 'undefined') {
    window.showDiagnosticsOverlay = showDiagnosticsOverlay;
  }
})();
