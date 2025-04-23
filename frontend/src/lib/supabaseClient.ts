// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  // Optionally throw an error or handle it gracefully
  // throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  console.error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  // Optionally throw an error
  // throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create and export the Supabase client
// Handle potential missing env vars gracefully if needed for build process
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Add a check function if needed elsewhere
export function isSupabaseConnected() {
    return !!supabaseUrl && !!supabaseAnonKey;
}
