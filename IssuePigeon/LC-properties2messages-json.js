/*
 * Convert jetpack add-on localization files .properties to web-ext messages.json format
 *
 * Run this script, e.g. on file:///var/tmp/IssuePigeonFirefox/IssuePigeon/locale/de.properties
 * and copy content from newly added pre element to manually created messages.json file.
 * Make sure Text Encoding is set to Unicode on the input file.
 */

let text = document.body.firstElementChild.textContent;
let propertyRegexp = /^(\S+)\s*=\s*((?:.*\\\n)*.*)/mg;
let match;
let json = {};
while (match = propertyRegexp.exec(text)) {
  json[match[1]] = {
    message: match[2].replace(/\\\n/g, '')
  };
}
console.log(json);
let jsonElement = document.createElement('pre');
jsonElement.textContent = JSON.stringify(json, null, 2);
jsonElement.contentEditable = true;
document.body.appendChild(jsonElement);
