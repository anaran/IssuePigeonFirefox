/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/*jslint browser: true, devel: true */
/*global findRegExpBar: false, chrome: false, console: false, require: false, document: false */
;'use strict';
//
// Replace /\b(const|let)\B/ with "$1 "
// Replace [/^( *)function (\w+)/] with [$1var $2 = function]
//
// Author: adrian.aichner@gmail.com
//
// Firefox Addon Content Script.
// require is not available in content scripts.
// let sp = require('sdk/simple-prefs');
(function() {
  let DEBUG_ADDON = false;
  try {
    // NOTE Set "DEBUG_ADDON = true" in the debugger before continuing to get console messages logged.
    // Make sure option "Console Logging Level" is not set to "off".
    //
    if (DEBUG_ADDON) {
      // debugger is statement, not expression.
      // DEBUG_ADDON && debugger;
      // causes exception.
      // debugger;
    }
    let avoidCircular4 = function (element, indent) {
      let seen = {
      };
      return JSON.stringify(element, function (key, value) {
        if (key) {
          if (value === element) {
            console.error('reference to top-level');
            return 'reference to top-level';
          }
          if (value === this) {
            console.error('reference to self');
            return 'reference to self';
          }
          if (value && value.hasOwnProperty('prototype')) {
            if (typeof value == 'function') {
              if (value.name) {
                if (value.prototype.constructor && value.prototype.constructor.name) {
                  console.log(value.name, 'has prototype.constructor', value.prototype.constructor.name);
                  return 'constructor ' + value.prototype.constructor.name;
                } else {
                  console.log(value.name, 'has prototype', value.prototype.constructor.name);
                  return 'anon constructor ' + value.prototype.constructor.toSource().substring(0, 80);
                }
              } else {
                // console.log(value.toSource().substring(0, 80), 'has prototype', value.prototype.toSource().substring(0, 80));
              }
            } else {
              console.error(value.prototype);
            }
          }
          if (typeof value == "function") {
            if (value.name) {
              console.log('value.name', value.name);
              return value.toSource().substring(0, 80);
            } else {
              console.log('value.toSource().substring(0, 80)', value.toSource().substring(0, 80));
            }
          }
          return value;
        } else {
          console.log('-----------------------------------------');
          return value;
        }
      }, indent);
    };
    DEBUG_ADDON &&
      console.log('Logging enabled via debugger');
    let loading = "content script $Format:%h%d$ loads in " + ((typeof document !== 'undefined' && document.URL) || 'no document (unit stesting?)') +
        " using " + JSON.stringify((typeof navigator !== 'undefined' && navigator.userAgent) || 'no navigator (unit stesting?)') + ' ' +
        // NOTE: Introduce fragment specifier before line spec to make
        // clickable link work in console.log.
        (new Error).stack.replace(/:(\d+):(\d+)/g, '#L$1C$2');
    DEBUG_ADDON &&
      console.log(loading);
    // TODO Place following code where timed section should start.
    if (console.time) {
      DEBUG_ADDON &&
        console.time('load time');
    }
    if (console.profile) {
      DEBUG_ADDON &&
        console.log('start profiling');
      DEBUG_ADDON &&
        console.profile('content script profile');
    }
    // Causes the same warning like all cross-site links opened programmatically.
    // let strWindowFeatures = undefined,
    let strWindowFeatures = 'resizable=yes,scrollbars=yes,toolbar=yes',
        jira = function JiraReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        bugzilla = function BugzillaReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        chromium = function ChromiumReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        github = function GithubReporter(aLocation, options) {
          let base = aLocation.pathname.match(options.matcher || /^\/[^/]+\/[^/#?]+/)[0];
          this.help = options.help || aLocation.origin + base + '/wiki';
          this.report = options.report || aLocation.origin + base + '/issues/new';
        },
        mailto = function MailToReporter(aLocation, options) {
          this.help = options.help;
          this.report = options.report;
        },
        wikipedia = function WikipediaReporter(aLocation, options) {
          let matches = (options.matcher || /^((?:\/[^/]+)+)\/([^/#?]+)/).exec(aLocation.pathname);
          this.help = options.help;
          this.report = options.report || aLocation.origin + '/w/index.php?title=Talk:'+matches[2]+'&action=edit';
        },
        constructors = {
          bugzilla: bugzilla,
          chromium: chromium,
          github: github,
          wikipedia: wikipedia,
          mailto: mailto
        },
        PigeonDispatcher = {
          extractLinksFromSelection: function () {
            var s = typeof window !== 'undefined' && window.getSelection();
            var rangeLinks = {
            };
            if (s) {
              for (var i = 0; i < s.rangeCount; i++) {
                var rc = s.getRangeAt(i).cloneContents();
                rc.querySelectorAll
                  && Array.prototype.forEach.call(rc.querySelectorAll('a[href]'), function (value) {
                  rangeLinks[value.href] = true;
                });
              }
            }
            return Object.keys(rangeLinks);
          },
          // NOTE: Keep double-quotes, don't use bare word keys so entries are directly usable in
          // "Extend Issue Pigeon" textarea.
          knownOrigins: {}
        };
    jira.prototype.fly = function () {
      // See https://developer.atlassian.com/display/JIRADEV/JIRA+REST+API+Example+-+Create+Issue#JIRARESTAPIExample-CreateIssue-Exampleofcreatinganissueusingprojectkeysandfieldnames.
      // Request
      // curl -D- -u fred:fred -X POST --data {see below} -H "Content-Type: application/json" http://localhost:8090/rest/api/2/issue/
      // Data
      // {
      //     "fields": {
      //        "project":
      //        {
      //           "key": "TEST"
      //        },
      //        "summary": "REST ye merry gentlemen.",
      //        "description": "Creating of an issue using project keys and issue type names using the REST API",
      //        "issuetype": {
      //           "name": "Bug"
      //        }
      //    }
      // }
      return true;
    };
    bugzilla.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      var link = this.report && this.report + '&comment='
      + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                   + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n')
      + '&bug_file_loc=' + window.encodeURIComponent(window.location.href)
      + '&short_desc=' + window.encodeURIComponent('Summarise issue or request about ' + document.title);
      DEBUG_ADDON &&       console.log(this, link);
      this.report && window.open(link, '_blank', strWindowFeatures);
      return true;
    };
    chromium.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report + '&comment='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n')
                                 + '&summary=' + window.encodeURIComponent('Summarise issue or request about ' + document.title), '_blank', strWindowFeatures
                                );
      return true;
    };
    // github.prototype.matcher = /^\/[^/]+\/[^/#?]+/;
    github.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report
                                 + '?title=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                 + '&body='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                                );
      return true;
    };
    mailto.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      // TODO Think of a better way to make this method testable via jpm test.
      if (typeof window === 'undefined') {
        return true;
      }
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      this.report && window.open(this.report
                                 + '?subject=' + window.encodeURIComponent('Summarise issue or request about ' + document.title)
                                 + '&body='
                                 + window.encodeURIComponent((rangeLinks.length ? 'See these links:\n\n'
                                                              + rangeLinks.join('\n') + '\n\n  referenced from\n\n' : 'See:\n\n') + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'), '_blank', strWindowFeatures
                                );
      return true;
    };
    // wikipedia.prototype.matcher = /^((?:\/[^/]+)+)\/([^/#?]+)/;
    wikipedia.prototype.fly = function () {
      let rangeLinks = PigeonDispatcher.extractLinksFromSelection();
      this.help && window.open(this.help, '_blank', strWindowFeatures);
      if (this.report) {
        let addition = (rangeLinks.length
                        ? '\nSee these links:\n\n' + rangeLinks.join('\n')
                        + '\n\n  referenced from\n\n' : 'See:\n\n')
        + window.location.href + '\n\nDetails:\n\n' + window.getSelection().toString() + '\n\nhttp://mzl.la/1vxCDgA\n\n'
        + '\n\n';
        let win = window.open(this.report, '_blank', strWindowFeatures);
        avoidCircular4(win, 2);
        //         let onReady = function (event) {
        //           DEBUG_ADDON &&       console.log(event.target);
        //           if (event.target.readyState !== 'complete') {
        //             return;
        //           }
        setTimeout(function () {
          let ta = win.document.querySelector('textarea#wpTextbox1.mw-ui-input');
          if (ta) {
            ta.value = addition + ta.value;
          }
        }, 3000);
        //         };
        //         win.onload = function () {
        //         win.addEventListener('readystatechange', onReady, false);
      }
      return true;
    };
    var reportFeedbackInformation = function (data, aTestLocation) {
      let copyright = typeof document !== 'undefined' && document.querySelector('meta[name=copyright]'),
          keywords = typeof document !== 'undefined' && document.querySelector('meta[name=keywords]'),
          description = typeof document !== 'undefined' && document.querySelector('meta[name=description]'),
          author = typeof document !== 'undefined' && document.querySelector('meta[name=author]'),
          generator = typeof document !== 'undefined' && document.querySelector('meta[name=generator]'),
          mailtos = [
          ],
          myLocation = typeof window !== 'undefined' ? window.location : aTestLocation;
      try {
        PigeonDispatcher.knownOrigins = data.known;
        if ('extensions' in data) {
          let additionalSites = JSON.parse(data.extensions);
          Object.keys(additionalSites).forEach(function (key) {
            if (PigeonDispatcher.knownOrigins.hasOwnProperty(key)) {
              console.warn('user overrides definition for',  key);
            }
            PigeonDispatcher.knownOrigins[key] = additionalSites[key];
          });
        }
      } catch (exception) {
        console.error(exception);
      }
      // TODO Please see
      // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#attribute-substrings
      Array.prototype.forEach.call(typeof document !== 'undefined' && document.querySelectorAll('a[href^="mailto:"]'), function (value) {
        mailtos.push(value.href);
      });
      var gpluses = [
      ];
      Array.prototype.forEach.call(typeof document !== 'undefined' && document.querySelectorAll('a[href^="https://plus.google.com/"]'), function (value) {
        gpluses.push(value.href);
      });
      var data = {
        knownOrigins: Object.getOwnPropertyNames(PigeonDispatcher.knownOrigins),
        copyright: copyright && copyright.content,
        keywords: keywords && keywords.content,
        description: description && description.content,
        author: author && author.content,
        generator: generator && generator.content,
        mailtos: mailtos,
        gpluses: gpluses,
        url: typeof document !== 'undefined' && document.URL,
        selection: typeof window !== 'undefined' && window.getSelection().toString(),
        rangeLinks: PigeonDispatcher.extractLinksFromSelection()
      };


      var handler = PigeonDispatcher.knownOrigins[myLocation.origin]
      || PigeonDispatcher.knownOrigins[
        myLocation.origin
        + myLocation.pathname.split("/", 2).join("/")];
      // if (handler.type)
      if (handler && handler.type) {
        let constr = constructors[handler.type];
        let derived = function DerivedReporter() {
          constr.call(this, myLocation, handler);
        };
        derived.prototype = Object.create(constr.prototype);
        derived.prototype.constructor = derived;
        if ((new derived()).fly()) {
          // FIXME: this is in fact supported, should not raise a notification!
          // (typeof self !== 'undefined') && self.port.emit('unsupported', 'reported by ' + constr.toString());
        }
        else {
          // NOTE: something went wrong for a supported site.
          (typeof self !== 'undefined') && self.port.emit('unsupported', JSON.stringify(data, null, 2));
        }
        return aTestLocation;
      }
      else {
        // This site is indeed not supported. Report it to possibly get support.
        (typeof self !== 'undefined') && self.port.emit('unsupported', JSON.stringify(data, null, 2));
      }
    };
    // if (typeof self !== 'undefined' && self.port) {
    DEBUG_ADDON &&
      console.log("self.port is true", self);
    self.port.on("show_feedback", function (data) {
      DEBUG_ADDON &&
        console.log("self.port.on show", self);
      var div = document.querySelector('#reportFeedbackInformation');
      if (div) {
        document.body.removeChild(div);
      }
      var efp = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      div = document.createElement('div');
      // var lastStyle = window.getComputedStyle(document.body.firstChild);
      div.style.position = 'fixed';
      // console.log(efp, window.getComputedStyle(efp));
      // div.style.background = 'transparent';
      let bodyBC = 'white';
      let efpBC = 'transparent';
      if (document && 'body' in document) {
        window.getComputedStyle(document.body).backgroundColor;
        window.getComputedStyle(efp).backgroundColor;
      }
      div.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
      div.style.color = window.getComputedStyle(efp).color;
      div.style.padding = '0';
      div.style.width = '48px';
      div.style.height = '48px';
      div.style.fontSize = 'large';
      div.style.backgroundImage = 'url('+data.icon+')';
      div.style.borderRadius = '3px';
      div.style.borderColor = div.style.color;
      // div.style.border = '2px solid';
      // window.getComputedStyle(document.querySelector('a')).backgroundColor;
      // a.style.color = lastStyle.backgroundColor;
      // div.style.fontSize = window.getComputedStyle(document.querySelector('h1') || document.querySelector('h2') || document.querySelector('body')).fontSize;
      // div.style.fontSize = 'x-large';
      div.id = 'reportFeedbackInformation';
      // window.alert(JSON.stringify(match, Object.getOwnPropertyNames(match), 2));
      //       knownSites[value].reporter(match[0]);
      if (document && 'body' in document) {
        document.body.appendChild(div);
      }
      DEBUG_ADDON && console.error('self.options received', JSON.stringify(self.options, null, 2));
      let updateIconPosition = function(data) {
        div.style.transition = 'opacity 2s linear 0s';
        div.style.opacity = 0;
        let keys = Object.keys(data.position);
        if (keys.length == 2) {
          keys.forEach(function(prop) {
            div.style[prop] = data.position[prop] + 'px';
          });
        }
        else {
          div.style.top = (window.innerHeight - div.getBoundingClientRect().height) / 2 + 'px';
          div.style.left = (window.innerWidth - div.getBoundingClientRect().width) / 2 + 'px';
        }
        // div.style.transition = 'left 0.5s linear 0s, top 0.5s linear 0s';
        // div.style.top = (window.innerHeight - div.getBoundingClientRect().height) / 2 + 'px';
        // div.style.left = "-40em";
        window.requestAnimationFrame(function(domHighResTimeStamp) {
          div.style.opacity = 0.7;
        });
      };
      updateIconPosition(data);
      // self.port.on('updateIconPosition', updateIconPosition);
      // NOTE Make sure to set element content before getting its client rect!
      DEBUG_ADDON &&
        console.log(div.getBoundingClientRect());
      if (true) {
        var menu = div.appendChild(document.createElement('div'));
        menu.className = 'menu';
        menu.style.display = 'none';
        menu.style.opacity = 0.7;
        menu.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
        menu.style.borderRadius = '3px';
        menu.style.borderColor = menu.style.color;
        menu.style.border = '2px solid';
        var action = menu.appendChild(document.createElement('div')).appendChild(document.createElement('a'));
        // action.textContent = self.options.metadata.title;
        action.textContent = data.menu.fly;
        action.href = 'Fly';
        // action.style.backgroundColor = (efpBC == 'transparent' ? bodyBC : efpBC);
        // action.title = 'Report issue based on tab and selection(s)';
        // NOTE: Use margin, instead of padding, to make link hard to hit by accident.
        // action.style.margin = '2mm';
        // action.style.position = 'relative';
        // action.style.top = '0';
        // action.style.left = '0';
        action.addEventListener('click', function (event) {
          console.log("selection", window.getSelection().toString());
          event.preventDefault();
          event.stopPropagation();
          reportFeedbackInformation(data);
        });
        var help = menu.appendChild(document.createElement('div')).appendChild(document.createElement('a'));
        help.style.display = 'inline-block';
        help.textContent = data.menu.help;
        help.href = 'Help';
        // help.style.padding = '2mm';
        help.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          self.port.emit('help');
          // document.body.removeChild(div);
        });
        var settings = menu.appendChild(document.createElement('div')).appendChild(document.createElement('a'));
        settings.style.display = 'inline-block';
        settings.textContent = data.menu.settings;
        settings.href = 'Settings';
        // settings.style.padding = '2mm';
        settings.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          // FIXME: Only works until a new tab receives response.
          // self.port.emit('request_options');
          self.port.emit('settings');
          // document.body.removeChild(div);
        });
        // var close = div.appendChild(document.createElement('div'));
        // close.innerHTML = '&cross;';
        // close.style.padding = '2mm';
        // close.addEventListener('click', function (event) {
        //   event.preventDefault();
        //   document.body.removeChild(div);
        // });
        div.addEventListener('click', function (event) {
          console.log("selection", window.getSelection().toString());
          event.preventDefault();
          event.stopPropagation();
          if (menu.style.display == 'none') {
            menu.style.display = 'inline-block';
          }
          else {
            menu.style.display = 'none';
          }
        });
      }
      let constrainClosestEdges = function(bcr) {
        let props = {};
        if (bcr.left + bcr.width / 2 > window.innerWidth / 2) {
          props.right = window.innerWidth - bcr.left - bcr.width;
        }
        else {
          props.left = bcr.left;
        }
        if (bcr.top + bcr.height / 2 > window.innerHeight / 2) {
          props.bottom = window.innerHeight - bcr.top - bcr.height;
        }
        else {
          props.top = bcr.top;
        }
        // reportError({bcr: bcr, props: props});
        return props;
      };
      // NOTE: See 
      // [1207595 – draggable APIs should not exist on elements until drag and drop is implemented on Android](https://bugzil.la/1207595)
      // reportError({"'draggable' in div": 'draggable' in div});
      if ('draggable' in div && "drag and drop") {
        // '<meta name="viewport" content="width=device-width,user-scalable=no">';
        // let meta = document.createElement('meta');
        // meta.name = 'viewport';
        // meta.content = 'width=device-width,initial-scale=1.0,user-scalable=no';
        // document.head.appendChild(meta);
        div.setAttribute('draggable', true);
        div.setAttribute('dropzone', 'move string:text/plain');
        div.setAttribute('title', 'drop me in place');
        // div.addEventListener('click', function (e) {
        //   reportError({ 'click': [ div.style.left, div.style.top ]});
        // });
        div.addEventListener('dragstart', function (e) {
          // e.stopPropagation();
          // e.preventDefault();
          // NOTE: the initial transition (the make the overlay noticed)
          // interferes with dragging it.
          div.style.transition = '';
          // e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', 'ok');
          // reportError('dragstart');
        });
        div.addEventListener('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          e.dataTransfer.effectAllowed = 'move';
          // if (e.buttons == 1/* && e.currentTarget === move*/) {
          div.style.left = (e.clientX - div.offsetWidth / 2) + 'px';
          div.style.top = (e.clientY - div.offsetHeight / 2) + 'px';
          // reportError({ 'dragover': [ div.style.left, div.style.top ]});
          // }
        });
        div.addEventListener('drop', function (e) {
          e.stopPropagation();
          e.preventDefault();
          // reportError({ 'drop': [ div.style.left, div.style.top ]});
          e.dataTransfer.dropEffect = 'none';
          // e.dataTransfer.clearData();
          let bcr = new DOMRect();
          bcr = this.getBoundingClientRect();
          // reportError({ 'bcr': bcr, 'drop': [ div.style.left, div.style.top ]});
          self.port.emit('request_position_save', constrainClosestEdges(bcr));
        });
      }
      if (true && "touch works on android too") {
        div.addEventListener('touchstart', function (e) {
          // (e.currentTarget == div) && e.preventDefault();
          div.style.transition = '';
          // reportError({ 'touchstart': [ div.style.left, div.style.top ]});
        });
        div.addEventListener('touchend', function (e) {
          // (e.currentTarget == div) && e.preventDefault();
          // Can't get this.getBoundingClientRect() to return a non-empty object.
          let bcr = new DOMRect();
          bcr = div.getBoundingClientRect();
          // reportError({ 'bcr': bcr, 'touchend': [ div.style.left, div.style.top ]});
          self.port.emit('request_position_save', constrainClosestEdges(bcr));
        });
        div.addEventListener('touchmove', function (e) {
          // if ((e.clientX - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (e.clientX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
          var touchX = e.touches[e.touches.length - 1].clientX;
          var touchY = e.touches[e.touches.length - 1].clientY;
          // e.stopPropagation();
          // e.preventDefault();
          // e.dataTransfer.dropEffect = 'move';
          // e.dataTransfer.effectAllowed = 'move';
          // if (e.buttons == 1/* && e.currentTarget === move*/) {
          div.style.left = (touchX - div.offsetWidth / 2) + 'px';
          div.style.top = (touchY - div.offsetHeight / 2) + 'px';
          // reportError({ 'touchmove': [ div.style.left, div.style.top ]});
          // }
          // }
        });
      }
      if (false && "mouse for desktop without touchscreen") {
        div.addEventListener('mousedown', function (e) {
          // if ((e.currentTarget == div)) {
          e.preventDefault();
          div.style.transition = '';
          // reportError({ 'mousedown': [ div.style.left, div.style.top ]});
          // }
        });
        div.addEventListener('mouseup', function (e) {
          // if ((e.currentTarget == div)) {
          e.preventDefault();
          // Can't get this.getBoundingClientRect() to return a non-empty object.
          let bcr = new DOMRect();
          bcr = this.getBoundingClientRect();
          self.port.emit('request_position_save', {
            left: this.style.left,
            right: this.style.right,
            top: this.style.top,
            bottom: this.style.bottom,
            width: this.style.width,
            height: this.style.height
          });
          // reportError({ 'mouseup': [ div.style.left, div.style.top ]});
          // }
        });
        div.addEventListener('mousemove', function (e) {
          // if ((e.currentTarget == div)) {
          // if ((e.clientX - taExtensions.offsetTop) < taExtensions.offsetHeight * 0.9 || (e.clientX - taExtensions.offsetLeft) < taExtensions.offsetWidth * 0.9) {
          // e.stopPropagation();
          e.preventDefault();
          // e.dataTransfer.dropEffect = 'move';
          // e.dataTransfer.effectAllowed = 'move';
          if (e.buttons == 1/* && e.currentTarget === move*/) {
            div.style.left = (e.clientX - div.offsetWidth / 2) + 'px';
            div.style.top = (e.clientY - div.offsetHeight / 2) + 'px';
            // reportError({ 'mousemove': [ div.style.left, div.style.top ]});
          }
          // }
          // }
        });
      }
    });
    // }
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
    (typeof self !== 'undefined') && self.port.emit('request_feedback');
    // exports.PigeonDispatcher = PigeonDispatcher;
  }
  catch (exception) {
    // DEBUG_ADDON &&
    // console.error(new Error());
    // DEBUG_ADDON &&
    // reportError(exception);
    // DEBUG_ADDON && console.error(exception);
    // DEBUG_ADDON && window.alert(exception.message + '\n\n' + exception.stack);
  }
  if (typeof exports !== 'undefined') {
    // Used by test/test-index.js
    exports.reportFeedbackInformation = reportFeedbackInformation;
  }
})();
