/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
;
'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
// Replace [/\Bof\s*/] With [ of ]
// Replace [/'(\w+)'/] With [$1]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
// NOTE: This is not valid JSON so that we can add comments
// and use unquoted field names and single quotes.
(function () {
  try {
    let DEBUG_ADDON = false;
    exports.knownOrigins = {
      'http://docs.couchdb.org': {
        type: 'jira',
        help: 'http://webchat.freenode.net/?channels=couchdb',
        report: 'https://REST_SHOULD_BE_USED_NOT_GET'
      },
      'https://developer.mozilla.org': {
        type: 'bugzilla',
        help: 'https://developer.mozilla.org/en-US/docs/MDN/About#Documentation_errors',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=Developer%20Documentation'
      },
      'https://www.mozilla.org': {
        type: 'bugzilla',
        help: 'https://www.mozilla.org/en-US/contribute/page/',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?product=www.mozilla.org&component=Pages%20%26%20Content'
      },
      'https://addons.mozilla.org': {
        type: 'bugzilla',
        help: 'https://addons.mozilla.org/en-US/developers/docs/policies/contact',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org'
      },
      // staging site for AMO
      'https://addons.allizom.org': {
        type: 'bugzilla',
        help: 'https://addons.mozilla.org/en-US/developers/docs/policies/contact',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?format=__default__&product=addons.mozilla.org'
      },
      'https://developer.chrome.com/apps': {
        type: 'chromium',
        help: 'https://developer.chrome.com/apps/faq',
        report: 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Apps'
      },
      'https://developer.chrome.com/extensions': {
        type: 'chromium',
        help: 'https://developer.chrome.com/extensions/faq',
        report: 'https://code.google.com/p/chromium/issues/entry?label=Cr-Platform-Extensions'
      },
      // github reporter uses argument passed to it to derive help
      // and report URL.
      'https://github.com': {
        type: 'github'
      },
      'https://www.npmjs.org': {
        type: 'github',
        report: 'https://github.com/npm/npm-www/issues/new'
      },
      'http://dev.w3.org/html5': {
        type: 'bugzilla',
        report: 'https://www.w3.org/Bugs/Public/enter_bug.cgi?format=__default__&product=HTML%20WG&component=HTML5%20spec'
      },
      // "https://groups.google.com/forum/#!forum/mozilla-labs-jetpack":
      // "https://groups.google.com/forum/#!forum/mozilla.dev.extensions":
      'http://codemirror.net': {
        type: 'github',
        // NOTE Not neded. A link to CONTRIBUTING.md is shown when reporting new issues.
        // "help": "https://github.com/marijnh/CodeMirror/blob/master/CONTRIBUTING.md#submitting-bug-reports",
        report: 'https://github.com/marijnh/CodeMirror/issues/new'
      },
      'resource://issue-pigeon-at-addons-dot-mozilla-dot-org': {
        type: 'github',
        help: "https://github.com/anaran/LastScrollChrome/blob/master/contributing.md",
        report: 'https://github.com/anaran/IssuePigeonFirefox/issues/new'
      },
      'https://en.wikipedia.org': {
        help: 'https://en.wikipedia.org/wiki/Wikipedia:Contact_us_-_Readers',
        type: 'wikipedia',
      },
      'http://www.freenode.net': {
        help: 'http://www.freenode.net/faq.shtml',
        report: 'mailto:support@freenode.net',
        type: 'mailto'
      },
      'https://wiki.mozilla.org': {
        help: 'https://wiki.mozilla.org/MozillaWiki:Help',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?product=Websites&component=wiki.mozilla.org',
        type: 'bugzilla'
      },
      'https://support.mozilla.org': {
        help: 'https://github.com/mozilla/kitsune',
        report: 'https://bugzilla.mozilla.org/enter_bug.cgi?product=support.mozilla.org',
        type: 'bugzilla'
      }
    };
  }
  catch (exception) {
    DEBUG_ADDON && console.error(exception);
    // DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
}) ();
