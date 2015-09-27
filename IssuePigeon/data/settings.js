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

  // self is undefined when using require in jpm test.
  (typeof self !== 'undefined') && self.port.on('load_settings', function(data) {
    Array.prototype.forEach.call(document.querySelectorAll('div.settings'), function(setting) {
      document.body.removeChild(setting);
    });
    data.metadata.preferences.forEach(function (prefDefinition) {
      let content = document.querySelector('template.' + prefDefinition.type + '').content;
      let prefUI = document.importNode(content, "deep").firstElementChild;
      let label = prefUI.children[0];
      let element = prefUI.children[1];
      let description = prefUI.children[2];
      label.textContent = prefDefinition.title;
      description.textContent = prefDefinition.description;
      switch (prefDefinition.type) {
        case "bool": {
          element.checked = data.prefs[prefDefinition.name];
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.checked
            });
          });
          element.name = prefDefinition.name;
          break;
        }
        case "string": {
          element.value = data.prefs[prefDefinition.name];
          element.addEventListener('change', function(event) {
            self.port.emit('save_setting', {
              name: prefDefinition.name,
              value: event.target.value
            });
          });
          element.name = prefDefinition.name;
          break;
        }
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
          element.name = prefDefinition.name;
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

  // self is undefined when using require in jpm test.
  (typeof self !== 'undefined') && self.port.emit('request_settings');
})();
