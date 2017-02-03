#!/usr/bin/env python
import sys, json
print(json.dumps(json.loads(sys.stdin.read()), indent=4, sort_keys=True))
