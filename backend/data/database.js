import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) throw new Error("supabaseUrl is required.");

const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) throw new Error("supabaseKey is required.");

export const supabase = createClient(supabaseUrl, supabaseKey);
