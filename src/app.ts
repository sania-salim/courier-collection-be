import express from "express";
import router from "./routes/routes";
import { pingDb } from "./db";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";

function createApp() {
  const app = express();

  // Middleware to parse JSON if needed
  app.use(express.json());

  // Routes
  app.use(router);

  app.get("/health", async (_req, res) => {
    const dbOk = await pingDb();

    if (!dbOk) {
      return res.status(503).json({ status: "error", db: "unavailable" });
    }

    res.json({ status: "ok", db: "ok" });
  });

  // 404 then error handler
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

export = createApp;
