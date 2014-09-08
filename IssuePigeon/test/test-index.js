/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
'use strict';
;(function() {
let DEBUG_ADDON = true;
// TODO Following two require statements are risky in this test module (they are under test here!)
let self = require('sdk/self');
let { metadata } = require("@loader/options");
let loading =
    'testing addon ' + (self.title || metadata.title || self.name) + ' ' + self.version + ' $Format:%h%d$ loads ' +
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
// jpm
// var main = require("../lib/main");
// cfx
var main = require("../lib/main");
// require("./main") || 

exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  done();
};

exports["test self"] = function(assert, done) {
  [
    "id",
    "name",
    "version"
  ].forEach(function(prop) {
    main.testSelfProperty(prop, function(value) {
      assert.ok((value !== undefined), "self." + prop
                + " is " + value);
      done();
    });
  });
    main.testSelfProperty("title", function(value) {
      assert.ok((value === undefined), "self." + "title"
                + " is " + value);
      done();
    });
  main.dummy(function(value) {
    assert.ok(value !== undefined, "metadata is " + value);
    assert.ok(value.title !== undefined, "metadata.title is " + value.title);
    done();
  });
};

require("sdk/test").run(exports);
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
})();
