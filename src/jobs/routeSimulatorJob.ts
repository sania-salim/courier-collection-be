import logger from "../utils/logger.js";
import config from "../config/index.js";
import { tick } from "../services/routeSimulatorService.js";

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let isRunning = false;

export function startRouteSimulatorJob() {
  if (!config.simulator.enabled) {
    logger.info("Route simulator disabled (ENABLE_ROUTE_SIMULATOR=false)");
    return;
  }

  if (intervalHandle) {
    return;
  }

  logger.info(
    `Starting route simulator (interval=${config.simulator.intervalMs}ms, jitter=${config.simulator.jitterMs}ms)`,
  );

  intervalHandle = setInterval(async () => {
    if (isRunning) {
      logger.warn("Route simulator tick skipped — previous tick still running");
      return;
    }

    isRunning = true;
    try {
      const result = await tick({ force: false });
      if (result.processed > 0 || result.errors.length > 0) {
        logger.info("Route simulator tick:", result);
      }
    } catch (err) {
      logger.error("Route simulator tick failed:", err);
    } finally {
      isRunning = false;
    }
  }, config.simulator.intervalMs);
}

export function stopRouteSimulatorJob() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    logger.info("Route simulator stopped");
  }
}
