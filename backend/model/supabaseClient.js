// supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load .env variables
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;
