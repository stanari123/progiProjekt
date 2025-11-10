import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) throw new Error("supabaseUrl is required.");

const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey) throw new Error("supabaseKey is required.");

export const db = createClient(supabaseUrl, supabaseKey);

export async function seed() {
    const { data, error } = await db
        .from("app_user")
        .select("*")
        .eq("role", "admin")
        .maybeSingle();

    if (error) {
        console.error("Error checking for admin user:", error);
        return;
    }

    if (!data) {
        const { insertError } = await db.from("app_user").insert({
            first_name: "Admin",
            last_name: "Demo",
            email: "admin@demo.hr",
            role: "admin",
            password_hash: await bcrypt.hash("admin123", 10),
        });
    }
}
