import path from "path";
import dotenv from "dotenv";
import { z } from "zod";
import logger from "../utils/logger";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const EnvSchema = z
  .object({
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

    DATABASE_URL: z.string().optional(),
    DB_HOST: z.string().default("localhost"),
    DB_PORT: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive())
      .default(5432),
    DB_NAME: z.string().min(1).optional(),
    DB_USER: z.string().min(1).optional(),
    DB_PASSWORD: z.string().min(1).optional(),
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

    ENABLE_ROUTE_SIMULATOR: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => v === "true")
      .default(false),

    SIMULATOR_INTERVAL_MS: z
      .string()
      .transform(Number)
      .pipe(z.number().int().positive())
      .default(120_000),

    SIMULATOR_JITTER_MS: z
      .string()
      .transform(Number)
      .pipe(z.number().int().nonnegative())
      .default(30_000),

    OPEN_ROUTE_SERVICE_API_KEY: z.string().min(1),
  })
  .superRefine((env, ctx) => {
    if (!env.DATABASE_URL && !env.DB_NAME) {
      ctx.addIssue({
        code: "custom",
        message: "Set DATABASE_URL or DB_NAME (and DB_USER, DB_PASSWORD)",
        path: ["DATABASE_URL"],
      });
    }
  })
  .transform((env) => {
    const dbName = env.DB_NAME ?? "courier_collection_stage_2_dev";
    const dbUser = env.DB_USER ?? "postgres";
    const dbPassword = env.DB_PASSWORD ?? "postgres";

    const databaseUrl =
      env.DATABASE_URL ??
      `postgresql://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@${env.DB_HOST}:${env.DB_PORT}/${dbName}`;

    return {
      ...env,
      DB_NAME: dbName,
      DB_USER: dbUser,
      DB_PASSWORD: dbPassword,
      DATABASE_URL: databaseUrl,
    };
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error("Invalid environment variables:", parsed.error.issues);
  process.exit(1);
}

export default parsed.data;
