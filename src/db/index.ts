import prisma from "./client.js";
import logger from "../utils/logger";

export { default as prisma } from "./client.js";

export async function pingDb(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (err) {
    logger.error("Database ping failed:", err);
    return false;
  }
}
