var self = require('sdk/self');

let DEBUG_ADDON = true;
let loading =
        'addon ' + self.name + ' ' + self.version + ' $Format:%h%d$ loads ' +
        // NOTE: Introduce fragment specifier before line spec to make
        // clickable link work in console.log.
        (new Error).stack.replace(/:(\d+):(\d+)/g, '#L$1C$2');
DEBUG_ADDON &&
    console.log(loading);
if (console.time) {
    DEBUG_ADDON &&
        console.time('load time');
}
if (console.profile) {
    DEBUG_ADDON &&
        console.log('start profiling');
    DEBUG_ADDON &&
        console.profile('addon ' + self.name + ' ' + self.version + 'profile');
}

// a dummy function, to show how tests work. 
// to see how to test this function, look at ../test/test-main.js
function dummy(text, callback) {
    callback(text);
}

exports.dummy = dummy;

// See https://blog.mozilla.org/addons/2013/06/13/jetpack-fennec-and-nativewindow
// get a global window reference
const utils = require('sdk/window/utils');
const recent = utils.getMostRecentBrowserWindow();
const notifications = require("sdk/notifications");
const qs = require("sdk/querystring");
const tabs = require("sdk/tabs");

var reportUnsupportedSite = function(data) {
    let title = self.name + ': Site not supported yet';
    notifications.notify({
        title: title,
        text: "\nClick to report this\n" + data,
        data: qs.stringify({
            title:
            title + ' in ' + self.version,
            body:
            "(Please review for any private data you may want to remove before submitting)\n\n" + data
        }),
        onClick: function (data) {
            tabs.open({
                inNewWindow: true,
                url: 'https://github.com/anaran/IssuePilotFirefox/issues/new?' + data,
                onClose: function() {
                    require("sdk/tabs").activeTab.activate();
                }});
        }});
};

if (recent.NativeWindow) {
    let nw = require('./nativewindow');
    nw.addContextMenu({
        name: self.name,
        context: nw.SelectorContext('a'),
        callback: function(target) {
            let worker = tabs.activeTab.attach({
                contentScriptFile: self.data.url('./reportFeedbackInformation.js'),
                onMessage: reportUnsupportedSite,
                // TODO Implement this as clickable issue reporting notification
                // onError:
            });
            worker.port.emit('show', "emitted from recent.NativeWindow");
        }});
} else {
    let cm = require("sdk/context-menu");
    cm.Item({
        label: self.name,
        context: cm.URLContext("*"),
        contentScriptFile: self.data.url('./reportFeedbackInformation.js'),
        onMessage: reportUnsupportedSite
    });
}
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
