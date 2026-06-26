import env from "./env";

const app = {
  protocol: env.APP_PROTOCOL,
  host: env.APP_HOST,
  port: env.APP_PORT,
};

const db = {
  url: env.DATABASE_URL,
};

// access all env variables through config
const config = {
  app: {
    ...app,
    baseUrl: `${app.protocol}://${app.host}:${app.port}`,
  },
  db: { ...db },
};

export default config;
