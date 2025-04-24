# frontend/api/index.py

import sys, os

# Add the `app/` directory to PATH so we can import flask app from there
sys.path.insert(
  0,
  os.path.abspath(os.path.join(os.path.dirname(__file__), 'app'))
)

from app import app   # now imports backend/app.py Flask instance named `app`
