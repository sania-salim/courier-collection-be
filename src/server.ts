import { createServer } from "http";
import { createHttpTerminator } from "http-terminator";
import createApp from "./app";
import config from "./config";
import logger from "./utils/logger";

export default function startServer() {
  const app = createApp();
  const server = createServer(app);
  const terminator = createHttpTerminator({ server });

  server.on("error", (err) => {
    logger.error("HTTP server error:", err);
  });

  const started = new Promise<void>((resolve) => {
    server.listen(config.app.port, () => {
      logger.info(`HTTP server listening on port ${config.app.port}`);
      resolve();
    });
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    try {
      await terminator.terminate();
      logger.info("Server closed. Bye!");
      process.exit(0);
    } catch (err) {
      logger.info("Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  return { server, terminator, started };
}
