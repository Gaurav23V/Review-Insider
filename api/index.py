# api/index.py
# This file acts as the entry point for Vercel's Python runtime.
# It imports the Flask app instance from your backend directory.

# Add the backend directory to the Python path
# This allows importing modules from the 'backend' folder
import sys
import os

# Get the absolute path of the directory containing this file (api/)
# Then go up one level to the project root
# Then go into the 'backend' directory
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.insert(0, backend_dir)

# Now import the Flask app instance from backend/app.py
# Make sure your Flask app instance in backend/app.py is named 'app'
try:
    from app import app
except ImportError as e:
    # Provide a helpful error message if the import fails
    print(f"Error importing Flask app from {backend_dir}/app.py: {e}")
    # You might want to raise the error or handle it differently
    # For Vercel deployment, often just letting it fail is okay
    # as the build logs will show the error.
    raise

# Vercel's Python runtime expects the WSGI application object
# (our Flask 'app') to be available. No need to call app.run().
# The file itself being present and importing 'app' is usually sufficient.
