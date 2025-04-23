# backend/clients/supabase_client.py

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_SECRET_KEY")

# This is our global Supabase client for inserts/queries
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
