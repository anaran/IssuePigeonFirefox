'use strict';

(function () {
let _ = key => browser.i18n.getMessage(key);
let localizedNodes = document.querySelectorAll('[data-l10n-id]');
Array.prototype.forEach.call(localizedNodes, function(node, index) {
  if ('textContent' in node) {
    node.textContent = _(node.getAttribute('data-l10n-id'));
  }
  if ('value' in node) {
    node.value = _(node.getAttribute('data-l10n-id'));
  }
});
})();
