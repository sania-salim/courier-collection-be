import * as fs from "fs";
import * as path from "path";
import { pool } from "./index";
import logger from "../utils/logger";

const run = async () => {

  // Step 1: Create a tracking table if it doesn't exist yet.
  // This is how the script knows which migrations have already run.
  // First time ever: this table is empty, so everything runs.
  // Second time: already-run files are skipped.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id      SERIAL PRIMARY KEY,
      name    TEXT NOT NULL UNIQUE,   -- the filename e.g. "001_create_regions.sql"
      run_at  TIMESTAMPTZ DEFAULT now()
    )
  `);

  // Step 2: Find all .sql files in the migrations folder and sort them.
  // Sorting ensures 001 always runs before 002, 002 before 003 etc.
  const migrationsDir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir).sort();

  // Step 3: Loop through every file
  for (const file of files) {

    // Check if this filename already exists in _migrations table
    const { rows } = await pool.query(
      "SELECT 1 FROM _migrations WHERE name = $1",
      [file]
    );

    if (rows.length === 0) {
      // Never run before — read the SQL file and execute it
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await pool.query(sql);

      // Record it so it never runs again
      await pool.query(
        "INSERT INTO _migrations (name) VALUES ($1)",
        [file]
      );
      console.log(` Ran migration: ${file}`);
    } else {
      // Already ran — skip it
      console.log(`Skipped (already ran): ${file}`);
    }
  }

  await pool.end(); // close the DB connection when done
};

run().catch((err) => {
  logger.error("Migration failed:", err);
  process.exit(1);
});