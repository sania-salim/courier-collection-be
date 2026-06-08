import { Pool } from "pg";
import config from "../config";
import logger from "../utils/logger";

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  min: config.db.pool.min,
  max: config.db.pool.max,
});

export async function pingDb(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

// Verify connection on startup
pool.connect((err, client, release) => {
  if (err) {
    logger.error(
      "Failed to connect to PostgreSQL:",
      err.message || err.name || err.toString(),
    );
    process.exit(1);
  }
  logger.info("PostgreSQL connected");
  release();
});
