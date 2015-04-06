let DEBUG_ADDON = false;
// self.port.emit('markdown', document.body.firstElementChild.textContent);
self.port.on("render", function (data) {
  DEBUG_ADDON &&
    console.log("self.port.on render", data);
  // document.body.firstElementChild.style.display = 'none';
  var markdownDiv = document.querySelector('.help_div');
  markdownDiv.innerHTML = data;
});
