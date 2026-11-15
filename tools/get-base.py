#!/usr/bin/env python3
"""Print the deployment path prefix derived from hugo.toml `baseURL`.

    $ python3 tools/get-base.py
    /
    # or, for a project page:
    /home/

Shell checkers use this so a domain move needs one edit, not seven.
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _baseurl import BASE  # noqa: E402

print(BASE)
