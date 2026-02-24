import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

const supabaseUrl = "https://xeabwfidxdxhqpjsbxmp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlYWJ3ZmlkeGR4aHFwanNieG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4OTA0NTYsImV4cCI6MjA4NzQ2NjQ1Nn0.NGRAfD6RRjkuPWq83cb1ORAo4aqF-TjQGfPlHyTXrXs";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
