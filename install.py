#!/usr/bin/env python
import socket
import random
import webbrowser
import BaseHTTPServer as bhs, SimpleHTTPServer as shs;
import os
import threading
import argparse
from subprocess import Popen, PIPE, call

def main(args):
  if (args.no_gui):
    install(args.email, args.password, args.message)
  else:
    print 'Sorry, GUI\'s not ready for you yet. Use the --no-gui flag.'

def install(email, password, message):
  if (os.path.exists('cookies') or os.path.exists('data')):
    ri = raw_input('It looks like there\'s an existing installation. Do you want to clear it and start afresh? (y/n) ')
    if (ri not in ['Y','y','yes']):
      print 'OK, doing nothing'
      return
    else:
      try:
        for f in (os.listdir('cookies')):
          os.remove('cookies/' + f)
        os.rmdir('cookies')
      except OSError:
        pass
      try:
        for f in (os.listdir('data')):
          os.remove('data/' + f)
        os.rmdir('data')
      except OSError:
        pass
  call(["bin/phantomjs", "js/install.js", args.email, args.password])
  if (message):
    os.mkdir('data')
    with file('data/replyMessage','w') as f:
      f.write(message)

  #Add to cron - currently MAC ONLY (though probably works for Linux)
  t = Popen(['crontab','-l'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
  op = t.stdout.read()
  if 'replyToMessages.js' in op:
    ri = raw_input('Looks like we\'ve already configured the cron job. Want me to recreate the entry? (If you\'re not sure, the answer is no) (y/n) ')
    if (ri not in ['Y','y','yes']):
      print 'OK, leaving crontab untouched'
      return
    else:
      op = '\n'.join(filter(lambda x: 'replyToMessages.js' not in x, op.split('\n')))
  if op:
    op += '\n'
  
  cron_command = '* * * * * cd ' + os.getcwd() + ';' + os.sep.join(['bin','phantomjs']) + ' ' + os.sep.join(['js','replyToMessages.js'])
  op += cron_command
  p = Popen(['crontab','-'], stdin=PIPE)
  p.communicate(op)


def startWebServer():
  port = findSparePort()
  print 'Found spare port: ' + str(port)
  t = ServerThread('html', port)
  t.start()
  print 'about to open browser'
  webbrowser.open('http://localhost:' + str(port))
  ri = raw_input('Should I quit?')

class ServerThread(threading.Thread):
  def __init__(self, directory, port):
    self.directory = directory
    self.port = port
    super(self.__class__, self).__init__()

  def run(self):
    os.chdir(self.directory)
    bhs.HTTPServer(("localhost", self.port), shs.SimpleHTTPRequestHandler).serve_forever()

def findSparePort():
  sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
  port = random.randint(1025, 65095)
  result = sock.connect_ex(('127.0.0.1',port))
  sock.close()

  if result == 0:
    return findSparePort()
  else:
    return port

if __name__ == '__main__':
  parser = argparse.ArgumentParser(description='Install luhtgadf')
  parser.add_argument('--no-gui', dest='no_gui', action='store_true', help='Disable GUI (you 1337 H4X0R, you).')
  parser.add_argument('--message', '-m', dest='message', help='Message to send to anyone attempting to contact you.')
  parser.add_argument('email')
  parser.add_argument('password')
  parser.set_defaults(no_gui=False)
  args = parser.parse_args()
  main(args)
