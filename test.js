console.log('running');
var page = require('webpage').create();
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
  initialLogin,
  enterApprovalCode,
  wait,
  saveBrowser,
  checkForLoginApproval,
  loadMainPageAndRender,
  wait
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

function initialLogin() {
  page.open("http://www.facebook.com/login.php", function(status) {
    page.evaluate(function(email, password, p) {
        document.querySelector("input[name='email']").value = email;
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
    document.getElementById('checkpointSubmitButton').click();
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

function loadMainPageAndRender() {
  page.open('http://www.facebook.com', function(status) {
    page.render('mainpage.png');

  });
}

function wait() {
  //I don't know why, but this seems to be essential...
}

function enableLoggingOfResponse() {
  page.onResourceReceived = function(response) {
    console.log('received resource');
    console.log('url: ' + response.url);
    console.log('contentType: ' + response.contentType);
    console.log('status: ' + response.status);
  }
}
