console.log('installing luhtgadf');
var stepIndex = 0;
var loadInProgress = false;

var system = require('system');
var page = require('webpage').create();

require('./setup');
var steps = require('./steps');

if (!(system.args.length === 3)) {
  console.log('Usage: luhtgadf.js <email> <password>');
  phantom.exit();
}
email = system.args[1];
password = system.args[2];

var steps = [
  steps.initialLogin,
  steps.enterApprovalCode,
  steps.wait,
  steps.saveBrowser,
  steps.wait,
  steps.saveCookies
]

setInterval(function() {
  if (!loadInProgress && typeof steps[stepIndex] == "function") {
    steps[stepIndex]();
    stepIndex++;
  }
  if (typeof steps[stepIndex] != "function") {
    phantom.exit();
  }
}, 2000);
