// supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
// Prefer service role key to bypass RLS; fall back to SUPABASE_KEY if misconfigured
const SUPABASE_KEY =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	process.env.SUPABASE_KEY ||
	process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
	console.warn("⚠️ Supabase URL or key not set; attachment uploads may fail.");
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
