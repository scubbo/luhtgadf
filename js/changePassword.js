console.log('attempting to change password');

var page = require('webpage').create();
var system = require('system');

if (!(system.args.length === 3)) {
  console.log('Usage: changePassword.js <oldPassword> <newPassword>');
  phantom.exit();
}

require('./setup');
var steps = require('./steps');

oldPassword = system.args[1]
newPassword = system.args[2]

steps.loadCookies();

page.open('https://www.facebook.com/settings?tab=account&section=password&view', function(status) {
  page.evaluate(function(oldPassword, newPassword) {
    oldInp = document.querySelector('input[name="password_old"]');
    newInp = document.querySelector('input[name="password_new"]');
    conInp = document.querySelector('input[name="password_confirm"]');

    oldInp.value = oldPassword;
    newInp.value = newPassword;
    conInp.value = newPassword;

    document.querySelector('input[id="u_t_1"]').click();

  }, oldPassword, newPassword);
  page.render('passwordChange.png');
})

setTimeout(function() {
  page.render('passwordChangeFile.png');
}, 5000);

setTimeout(function() {
  phantom.exit();
}, 10000);
