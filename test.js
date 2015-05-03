console.log('running');
var page = require('webpage').create();
var fs = require('fs');
var system = require('system');
var stepIndex = 0;
var loadInProgress = false;

if (!(system.args.length === 3)) {
  console.log('Usage: luhtgadf.js <email> <password>');
  phantom.exit();
}
email = system.args[1];
password = system.args[2];

page.onConsoleMessage = function(msg) {    
  console.log(msg);
};

page.onLoadStarted = function() {
  loadInProgress = true;
};

page.onLoadFinished = function() {
  loadInProgress = false;
};

page.onCallback = function(data) {
  if (data.renderit) {
    page.render(data.renderit);
  }
  if (data.outputLine) {
    system.stdout.writeLine(data.outputLine);
  }
  if (data.output) {
    system.stdout.write(data.output);
  }
  if (data.readLine) {
    return system.stdin.readLine();
  }
}

var steps = [
  loadCookies,
  initialLogin,
  enterApprovalCode,
  wait,
  saveBrowser,
  checkForLoginApproval,
  wait,
  listUnreadMessages,
  saveCookies
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

function loadCookies() {
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
  }
}

function initialLogin() {
  page.open("http://www.facebook.com/login.php", function(status) {
    page.evaluate(function(email, password, p) {
        emailInput = document.querySelector("input[name='email']");
        if (emailInput == null) {return;}//We're logged in already - no need to do this}
        emailInput.value = email;
        document.querySelector("input[name='pass']").value = password;

        document.querySelector("#login_form").submit();

        console.log("Login submitted!");
    }, email, password, page);
  });
}

function enterApprovalCode() {
  page.evaluate(function() {
    inp = document.querySelector("input[name='approvals_code']");
    if (inp != null) {
      //Code is required from Code Generator
      window.callPhantom({outputLine:'It looks like this is your first time using this script. Please enter the security code from your Code Generator below:'});
      window.callPhantom({output:'>>> '});
      inp.value = window.callPhantom({readLine:'someline'});
      //document.querySelector("form#u_0_1").submit();
      document.getElementById('checkpointSubmitButton').click();
      console.log('Security code submitted');
    }
  });
}

function saveBrowser() {
  page.evaluate(function() {
    but = document.getElementById('checkpointSubmitButton');
    if (but == null) {return;}//Already logged in - no need to confirm browser}
    but.click();
  });
}

function checkForLoginApproval() {
  page.evaluate(function() {
    if (~document.documentElement.innerHTML.indexOf('Someone recently tried to log in to your account')) {
      window.callPhantom({outputLine:'You have enabled login approvals (good for you!). Please log in to your Facebook account (using your normal browser) and approve this login attempt. Press enter when done.'})
      window.callPhantom({readLine:'someline'});
    }
  });
}

function listUnreadMessages() {
  page.open('http://www.facebook.com/messages', function(status) {
    page.evaluate(function() {
      messages = document.querySelector('div[aria-label="List of message threads"] ul').children;
      for (var i = 0; i<messages.length; i++) {
        if (messages[i].classList.contains('_kx')) {
          user = messages[i].querySelector('div._l2 span._l1').innerHTML
          console.log('you have a new message from ' + user);
        }
      }
    });
  });
}

function wait() {
  //I don't know why, but this seems to be essential...
}

function saveCookies() {
  if (!fs.exists('cookies')) {
    fs.makeDirectory('cookies');
  }

  for (var i=0; i<page.cookies.length; i++) {
    cookie = page.cookies[i];
    cookieName = cookie['name'];
    fs.write('cookies/' + cookieName + '.cookie', JSON.stringify(cookie), 'w');
  }
}
