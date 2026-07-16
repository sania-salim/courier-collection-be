import env from "./env";

const app = {
  protocol: env.APP_PROTOCOL,
  host: env.APP_HOST,
  port: env.APP_PORT,
};

const db = {
  url: env.DATABASE_URL,
  host: env.DB_HOST,
  port: env.DB_PORT,
  name: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  pool: {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
  },
};

const config = {
  app: {
    ...app,
    baseUrl: `${app.protocol}://${app.host}:${app.port}`,
  },
  db: { ...db },
  simulator: {
    enabled: env.ENABLE_ROUTE_SIMULATOR,
    intervalMs: env.SIMULATOR_INTERVAL_MS,
    jitterMs: env.SIMULATOR_JITTER_MS,
  },
  routeService: {
    openRouteService: {
      apiKey: env.OPEN_ROUTE_SERVICE_API_KEY,
    },
  },
};

export default config;
