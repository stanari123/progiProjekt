import { createClient } from "@supabase/supabase-js";
export const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const { Client, Pool } = require("pg");

const pool = new Pool({
    user: "placeholder",
    host: "placeholder",
    database: "placeholder",
    password: "placeholder",
    port: "placeholder",
});

async function connectClient() {
    const client = await pool.connect();
    try {
        console.log("Successful connection to db.");
    } catch (error) {
        console.error("Connection error to db.");
    } finally {
        client.release();
    }
}

connectClient();
