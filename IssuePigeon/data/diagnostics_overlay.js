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
  //  const DEBUG_ADDON = false;
  //  return {

  function getAllPropertyNames(obj, props = []) {
    // console.log(obj.constructor.name, props);
    if (obj.constructor.name == 'Object') {
      // console.log(obj.constructor.name, props);
      return props.length ? props : null;
      // return props;
    } else {
      // console.log(obj, props);
      return getAllPropertyNames(Object.getPrototypeOf(obj), props.concat(Object.getOwnPropertyNames(obj)));
    }
  }

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
      entry.textContent = (JSON.stringify(data.err, getAllPropertyNames(data.err), data.indent || 0));
      if (box.firstElementChild) {
        box.insertBefore(entry, box.firstElementChild);
      }
      else {
        box.appendChild(entry);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.showDiagnosticsOverlay = showDiagnosticsOverlay;
  }
})();
