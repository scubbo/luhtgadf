var system = require('system');
//var page = require('webpage').create();
var fs = require('fs');

if (fs.exists('data/replyMessage')) {
  replyMessage = fs.read('data/replyMessage');
} else {
  replyMessage = 'Hello! This user is using luhtgadf to automatically reply to messages. You should contact them by other means if it\'s urgent.';
}

exports.loadCookies = function() {
  cookiesPath = 'cookies/'
  if (fs.exists(cookiesPath)) {
    filelist = fs.list(cookiesPath)
    for (var i = 0; i<filelist.length; i++) {
      if (filelist[i][0] == '.') {
        continue; //Skip special files
      }
      cookieContents = fs.read(cookiesPath + filelist[i]);
      page.addCookie(JSON.parse(cookieContents));
    }
  } else {
    console.log('attempted to load cookies but cookie path ' + cookiesPath + ' does not exist!');
    phantom.exit();
  }
}

exports.initialLogin = function() {
  page.open("http://www.facebook.com/login.php", function(status) {
    page.evaluate(function(email, password, p) {
        document.querySelector("input[name='email']").value = email;
        document.querySelector("input[name='pass']").value = password;

        document.querySelector("#login_form").submit();

        console.log("Login submitted!");
    }, email, password, page);
  });
}

exports.enterApprovalCode = function() {
  page.evaluate(function() {
    inp = document.querySelector("input[name='approvals_code']");
    if (inp != null) {
      //Code is required from Code Generator
      window.callPhantom({outputLine:'You\'ve enabled two-factor auth for your Facebook account (Good for you!). Please enter the security code from your Code Generator below:'});
      window.callPhantom({output:'>>> '});
      inp.value = window.callPhantom({readLine:'someline'});
      document.getElementById('checkpointSubmitButton').click();
      console.log('Security code submitted');
    }
  });
}

exports.saveBrowser = function() {
  page.evaluate(function() {
    but = document.getElementById('checkpointSubmitButton');
    if (but == null) {return;}//Already logged in - no need to confirm browser}
    but.click();
  });
}

exports.checkForLoginApproval = function() {
  page.evaluate(function() {
    if (~document.documentElement.innerHTML.indexOf('Someone recently tried to log in to your account')) {
      window.callPhantom({outputLine:'You have enabled login approvals (good for you!). Please log in to your Facebook account (using your normal browser) and approve this login attempt. Press enter when done.'})
      window.callPhantom({readLine:'someline'});
    }
  });
}

exports.listUnreadMessages = function() {
  page.open('http://www.facebook.com/messages', function(status) {
    page.evaluate(function() {
    });
  });
}

exports.replyToUnreadMessages = function() {
  page.open('http://www.facebook.com/messages', function(status) {
    page.evaluate(function(replyMessage) {
      messages = document.querySelector('div[aria-label="List of message threads"] ul').children;
      for (var i = 0; i<messages.length; i++) {
        if (messages[i].classList.contains('_kx')) {
          user = messages[i].querySelector('div._l2 span._l1').innerHTML;
          //Select message
          messages[i].querySelector('div._l4').click();
          document.querySelector('._1rv').value = replyMessage;
          document.querySelector('#u_0_x').click();
        }
      }
    }, replyMessage);
  });
}

exports.wait = function() {
  //I don't know why, but this seems to be essential...
}

exports.render = function() {
  page.evaluate(function() {
    window.callPhantom({renderit:'a_render.png'});
  });
}

exports.saveCookies = function() {
  if (!fs.exists('cookies')) {
    fs.makeDirectory('cookies');
  }

  for (var i=0; i<page.cookies.length; i++) {
    cookie = page.cookies[i];
    cookieName = cookie['name'];
    fs.write('cookies/' + cookieName + '.cookie', JSON.stringify(cookie), 'w');
  }
}
