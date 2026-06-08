import * as fs from "fs";
import * as path from "path";
import { pool } from "./index";

const isDev = process.argv.includes("--dev");

const run = async () => {
  const client = await pool.connect();

  try {
    const dirs = [path.join(__dirname, "seeds")];

    if (isDev) {
      dirs.push(path.join(__dirname, "seeds/dev"));
    }

    for (const dir of dirs) {
      const files = fs.readdirSync(dir)
        .filter(f => f.endsWith(".sql"))
        .sort();

      for (const file of files) {
        const sql = fs.readFileSync(path.join(dir, file), "utf-8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("COMMIT");
          console.log(`Seeded: ${file}`);
        } catch (err) {
          await client.query("ROLLBACK");
          throw new Error(`Seed failed on ${file}: ${(err as Error).message}`);
        }
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
};

run().catch(err => {
  console.error("Error seeding database:", err.message);
  process.exit(1);
});
