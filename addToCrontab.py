#!/usr/bin/env python
import argparse
from subprocess import Popen, PIPE

def main(args):
  t = Popen(['crontab','-l'], stdin=PIPE, stdout=PIPE, stderr=PIPE)
  op = t.stdout.read()
  command = args.command
  if op:
    op += '\n'
  op += '1 0 * * * ' + command
  p = Popen(['crontab','-'], stdin=PIPE)
  p.communicate(op)

if __name__ == '__main__':
  parser = argparse.ArgumentParser()
  parser.add_argument('command')
  args = parser.parse_args()
  main(args)
