import startServer from "./server";
import logger from "./utils/logger";

let terminator;

(async () => {
  const startedResult = startServer();
  terminator = startedResult.terminator;

  await startedResult.started;

})();

process.on("unhandledRejection", async (reason) => {
  logger.error("Initial map generation failed:", reason);

  if (terminator && typeof terminator.terminate === "function") {
    try {
      await terminator.terminate();
    } catch (e) {
      logger.error("Error terminating server after unhandled rejection:", e);
    }
  }

  process.exit(1);
});

process.on("uncaughtException", async (err) => {
  logger.error("Uncaught Exception:", err);

  if (terminator && typeof terminator.terminate === "function") {
    try {
      await terminator.terminate();
    } catch (e) {
      logger.error("Error terminating server after uncaught exception:", e);
    }
  }

  process.exit(1);
});
