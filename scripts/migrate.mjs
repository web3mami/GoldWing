// Runs db/schema.sql against Neon.
// Usage: node --env-file=.env.local scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/migrate.mjs");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const schema = readFileSync(join(__dirname, "..", "db", "schema.sql"), "utf8");

// Strip line comments first (they may contain semicolons), then split on ";".
const statements = schema
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`Running ${statements.length} statements against Neon...`);
for (const [i, statement] of statements.entries()) {
  const label = statement.split("\n")[0].slice(0, 60);
  try {
    await sql.query(statement);
    console.log(`  [${i + 1}/${statements.length}] OK  ${label}`);
  } catch (err) {
    console.error(`  [${i + 1}/${statements.length}] FAIL ${label}`);
    console.error(err.message);
    process.exit(1);
  }
}
console.log("Migration complete.");
