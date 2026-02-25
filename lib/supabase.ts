import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

// Use process.env to access variables from your .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Optional: Add a safety check to warn you if keys are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env file!");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);