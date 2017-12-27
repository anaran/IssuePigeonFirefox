window.optionsDefinitions = {
  "preferences": [
    {
      "description": "Issue Pigeon loading into newly opened tabs can be disabled, immediate, or delayed to when a tab is activated again.",
      "hidden": false,
      "name": "loading",
      "title": "Loading",
      "value": "immediate",
      "type": "radio",
      "options": [{
        "value": "disabled",
        "label": "Disabled"
      }, {
        "value": "immediate",
        "label": "Immediate"
      }, {
        "value": "delayed",
        "label": "Delayed"
      }]
    },
    {
      "description": "Diagnostic messages are displayed directly in the current browser tab. This can be useful when the add-on is not working as expected, but will be irritating in regular use.",
      "hidden": false,
      "name": "diagnostics_overlay",
      "title": "Show Diagnostic Messages in Overlay",
      "type": "bool",
      "value": false
    },
    {
      "description": "This preference shall be hidden, except for debug purposes. It is changed by the user dragging the icon into place.",
      "hidden": true,
      "name": "position",
      "title": "Icon Positioning",
      "type": "string",
      "value": ""
    },
    {
      "description": "User-defined extensions to known sites. By turning on \"Show Diagnostic Messages in Overlay\" you can copy/paste one of the definitions under the \"known\" field here and edit it for your needs.",
      "hidden": false,
      "name": "JSON_KNOWN_SITES_EXTENSIONS",
      "title": "User-defined extensions to known sites",
      "type": "string",
      "value": "{}"
    },
    {
      "description": "Controls the amount of logging to the browser console by level, from all to errors only to nothing at all. Increase the log level when investigating problems.",
      "name": "sdk.console.logLevel",
      "type": "radio",
      "title": "Console Logging Level",
      "value": "off",
      "options": [{
        "value": "all",
        "label": "all"
      }, {
        "value": "debug",
        "label": "debug"
      }, {
        "value": "info",
        "label": "info"
      }, {
        "value": "warn",
        "label": "warn"
      }, {
        "value": "error",
        "label": "error"
      }, {
        "value": "off",
        "label": "off"
      }]
    }]
};
console.log(window.optionsDefinitions);
