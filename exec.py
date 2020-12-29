import sys

code = ''
for line in sys.stdin:
    if line == '\x04\n': # catch ascii Ctrl+D
        break
    code += line

exec(code)