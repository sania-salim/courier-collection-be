// config/env.ts
import path from "path";
import dotenv from "dotenv";
import { z } from "zod";
import logger from "../utils/logger";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const EnvSchema = z.object({
  // App
  APP_PROTOCOL: z.enum(["http", "https"]).default("http"),
  APP_HOST: z.string().default("localhost"),
  APP_PORT: z
    .string()
    .transform((v) => Number(v))
    .refine(
      (v) => Number.isInteger(v) && v > 0,
      "APP_PORT must be a positive integer",
    )
    .default(5000),

  // DB
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default(5432),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_POOL_MIN: z
    .string()
    .transform(Number)
    .pipe(z.number().int().nonnegative())
    .default(2),
  DB_POOL_MAX: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default(10),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export default parsed.data;
