import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local");
}

// Neon serverless HTTP client — ideal for Vercel serverless / edge functions.
// Usage: const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
export const sql = neon(process.env.DATABASE_URL);
