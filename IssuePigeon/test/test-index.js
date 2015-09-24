/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
//
// Author: adrian.aichner@gmail.com
//
;(function() {
  let DEBUG_ADDON = true;
  let sp = require('sdk/simple-prefs');
  // See https://github.com/mozilla-jetpack/jpm/issues/339
  sp.prefs['sdk.console.logLevel'] = 'info';
  // console.error('sdk.console.logLevel', sp.prefs['sdk.console.logLevel']);
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
  var lo = require("@loader/options");
  console.dir(lo);
  const jpm = lo && lo.metadata.title;
  console.log("jpm", jpm);
  const mainPath = jpm ? '../lib/main' : 'lib/main';
  var main = require(mainPath);
  exports["test main"] = function(assert) {
    // Content scripts cannot export anything, but we can check for
    // syntax errors this way.
    const rfiPath = jpm ? '../data/reportFeedbackInformation' : 'data/reportFeedbackInformation';
    let rfi = require(rfiPath);
    assert.notEqual(typeof rfi, "undefined", "undefined !== require('../data/reportFeedbackInformation')");
    assert.ok(true, rfi);
    let testLocation = {
      href: 'https://github.com/anaran/IssuePigeonFirefox/tree/master/IssuePigeon',
      pathname: '/anaran/IssuePigeonFirefox/tree/master/IssuePigeon',
      origin: 'https://github.com'
    };
    const koPath = jpm ? '../data/known-origins' : 'data/known-origins';
    let ko = require(koPath);
    assert.notEqual(typeof ko, "undefined", "undefined !== require('"+koPath+"')");
    assert.ok(true, ko);
    let originPayload = { 'known': ko.knownOrigins, 'extensions':  "{\"no site data\": \"available\"}"};
    // console.log('rfi', rfi);
    // Prints source code of function nicely!
    // console.log('rfi.reportFeedbackInformation.toString()', rfi.reportFeedbackInformation.toString());
    // let PigeonDispatcher object is undefined
    // console.log('rfi.PigeonDispatcher', rfi.PigeonDispatcher);
    assert.ok(rfi.reportFeedbackInformation(originPayload, testLocation), "reportFeedbackInformation shows no runtime errors");
    const eksPath = jpm ? '../data/extendKnownSites' : 'data/extendKnownSites';
    let eks = require(eksPath);
    assert.notEqual(typeof eks, "undefined", "undefined !== require('../data/extendKnownSites')");
    // Prints source code of function nicely!
    // console.log('eks.showKnownSitesExtensions.toString()', eks.showKnownSitesExtensions.toString());
    assert.ok(eks.showKnownSitesExtensions(originPayload), "eks.showKnownSitesExtensions shows no runtime errors");
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
