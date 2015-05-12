console.log('running');
var stepIndex = 0;
var loadInProgress = false;

var page = require('webpage').create();

require('./setup');
var steps = require('./steps');

var steps = [
  steps.loadCookies,
//  steps.initialLogin,
//  steps.wait,
  //steps.listUnreadMessages,
  steps.replyToUnreadMessages,
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
