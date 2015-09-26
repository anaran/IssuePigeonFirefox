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
  var reportError = function(err, indent) {
    const DEBUG_ADDON = true;
    if (!DEBUG_ADDON) {
      return;
    }
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
        box.style.height = '25%';
        box.style.left = '2mm';
        box.style.overflow = 'auto';
        box.style.position = 'fixed';
        box.style.resize = 'both';
        box.style.width = '25%';
        var close = div.appendChild(document.createElement('div'));
        close.innerHTML = '&cross;';
        close.style.position = 'fixed';
        close.style.bottom = '2mm';
        close.style.left = '2mm';
        close.style.margin = '2mm';
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
      entry.textContent = (JSON.stringify(err, null, indent || 0));
      if (box.firstElementChild) {
        box.insertBefore(entry, box.firstElementChild);
      }
      else {
        box.appendChild(entry);
      }
    }
  };

  // reportError({ 'ready': 'whenever you are...' });
  // self is undefined when running jpm test.
  (typeof self !== 'undefined') && self.port.on('load_settings', function(data) {
    reportError(data, 2);
    data.metadata.preferences.forEach(function (prefDefinition) {
      let content = document.querySelector('template.' + prefDefinition.type + '').content;
      let prefUI = document.importNode(content, "deep").firstElementChild;
      let label = prefUI.children[0];
      let element = label.firstElementChild;
      let description = prefUI.children[1];
      label.firstChild.textContent = prefDefinition.title;
      description.textContent = prefDefinition.description;
      switch (prefDefinition.type) {
        case "string": {
          element.value = data.prefs[prefDefinition.name];
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
        }
          break;
        case "menulist": {
          let content2 = document.querySelector('template.' + prefDefinition.type + '_item').content;
          prefDefinition.options.forEach(function (item) {
            let prefUI2 = document.importNode(content2, "deep").firstElementChild;
            prefUI2.textContent = item.label;
            prefUI2.value = item.value;
            if (data.prefs[prefDefinition.name] == item.value) {
              prefUI2.selected = true;
            }
            element.appendChild(prefUI2);
          });
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
          break;
        }
        case "radio": {
          let content2 = document.querySelector('template.' + prefDefinition.type + '_item').content;
          prefDefinition.options.forEach(function (item) {
            let prefUI2 = document.importNode(content2, "deep").firstElementChild;
            let label = prefUI2.firstChild
            label.textContent = item.label;
            let radio = prefUI2.firstElementChild;
            radio.value = item.value;
            radio.name = prefDefinition.name;
            if (data.prefs[prefDefinition.name] == radio.value) {
              radio.checked = true;
            }
            element.appendChild(prefUI2);
          });
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
          break;
        }
      }
      document.body.appendChild(prefUI);
    });
  });

  // self is undefined when running jpm test.
  (typeof self !== 'undefined') && self.port.emit('request_settings');
})();
