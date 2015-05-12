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
