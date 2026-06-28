import prisma from "../db/client.js";
import config from "../config/index.js";
import logger from "../utils/logger.js";
import {
  consolidateAtRegion,
  sealNonEmptyOpenBagsAtRegion,
  type ConsolidationSummary,
} from "./consolidationService.js";
import {
  completeJourney,
  getJourneyById,
  startJourney,
} from "./journey.js";
import { assignBagToVehicle } from "./sealedBag.js";
import { applyPackageMovement } from "./packageScanLog.js";
import {
  getFirstStop,
  getNextStop,
  getSimulatorArrivalTime,
  isFinalStop,
  type RouteStopRow,
} from "../utils/routeUtils.js";

function appendConsolidationSteps(
  consolidation: ConsolidationSummary,
  hubName: string,
  steps: string[],
  addedLabel: string,
) {
  if (consolidation.packagesAdded > 0) {
    steps.push(
      `${addedLabel} ${consolidation.packagesAdded} package(s) at ${hubName}`,
    );
  }
  if (consolidation.skipped > 0) {
    steps.push(`Skipped ${consolidation.skipped} package(s) at ${hubName}`);
    steps.push(...consolidation.skipReasons.slice(0, 5));
  }
}

const journeyInclude = {
  vehicle: true,
  route: {
    include: {
      stops: {
        orderBy: { stopOrder: "asc" as const },
        include: { region: true },
      },
    },
  },
};

type JourneyWithRoute = Awaited<
  ReturnType<typeof prisma.journey.findFirst>
> & {
  vehicle: { id: string; vehicleNumber?: number } | null;
  route: {
    id: string;
    code?: string;
    stops: RouteStopRow[];
  } | null;
};

async function syncBagTotals(bagId: string) {
  const packages = await prisma.courierPackage.findMany({
    where: { sealedBagId: bagId },
    select: { weight: true },
  });

  await prisma.sealedBag.update({
    where: { id: bagId },
    data: {
      itemCount: packages.length,
      weight: packages.reduce((sum, pkg) => sum + pkg.weight, 0),
    },
  });
}

async function markPackagesDeparted(
  vehicleId: string,
  hubRegionId: string,
  hubName: string,
) {
  const packagesOnVehicle = await prisma.courierPackage.findMany({
    where: { sealedBag: { vehicleId } },
  });

  for (const pkg of packagesOnVehicle) {
    await applyPackageMovement(
      pkg.id,
      { status: "EN_ROUTE_TO_REGION" },
      `Departed ${hubName} on vehicle`,
    );
  }
}

async function loadSealedBagsOntoVehicle(
  vehicleId: string,
  hubRegionId: string,
  routeId: string,
  hubName: string,
): Promise<number> {
  const sealedBags = await prisma.sealedBag.findMany({
    where: {
      currentRegionId: hubRegionId,
      routeId,
      status: "SEALED",
      vehicleId: null,
    },
    orderBy: { id: "asc" },
  });

  let loaded = 0;
  for (const bag of sealedBags) {
    try {
      await assignBagToVehicle(bag.id, vehicleId);
      loaded += 1;
    } catch (err) {
      logger.warn(
        `Skipping bag ${bag.id} for vehicle ${vehicleId}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  if (loaded > 0) {
    await prisma.sealedBag.updateMany({
      where: { vehicleId, status: "LOADED" },
      data: { status: "IN_TRANSIT" },
    });

    await markPackagesDeparted(vehicleId, hubRegionId, hubName);
  }

  return loaded;
}

async function unloadAtIntermediateStop(
  vehicleId: string,
  hubRegionId: string,
  hubName: string,
) {
  const bags = await prisma.sealedBag.findMany({
    where: { vehicleId },
    include: { courierPackages: true },
  });

  for (const bag of bags) {
    for (const pkg of bag.courierPackages) {
      if (pkg.toRegionId === hubRegionId) {
        await applyPackageMovement(
          pkg.id,
          {
            currentRegionId: hubRegionId,
            status: "ARRIVED_AT_REGION",
            sealedBagId: null,
          },
          `Arrived at ${hubName} — delivered at hub`,
        );
      } else {
        await applyPackageMovement(
          pkg.id,
          {
            currentRegionId: hubRegionId,
            status: "ADDED_TO_BAG",
          },
          `Arrived at ${hubName} — in bag awaiting next leg`,
        );
      }
    }

    await syncBagTotals(bag.id);

    const remainingCount = await prisma.courierPackage.count({
      where: { sealedBagId: bag.id },
    });

    await prisma.sealedBag.update({
      where: { id: bag.id },
      data: {
        vehicleId: null,
        currentRegionId: hubRegionId,
        status: remainingCount > 0 ? "OPEN" : "ARRIVED",
        timeArrivedAt: new Date(),
      },
    });
  }
}

async function unloadAtFinalStop(
  vehicleId: string,
  hubRegionId: string,
  hubName: string,
) {
  const bags = await prisma.sealedBag.findMany({
    where: { vehicleId },
    include: { courierPackages: true },
  });

  for (const bag of bags) {
    for (const pkg of bag.courierPackages) {
      const deliveredAtHub = pkg.toRegionId === hubRegionId;
      await applyPackageMovement(
        pkg.id,
        {
          currentRegionId: hubRegionId,
          status: "ARRIVED_AT_REGION",
          sealedBagId: deliveredAtHub ? null : pkg.sealedBagId,
        },
        deliveredAtHub
          ? `Arrived at ${hubName} — final destination`
          : `Arrived at ${hubName} — route end`,
      );
    }

    await prisma.sealedBag.update({
      where: { id: bag.id },
      data: {
        vehicleId: null,
        currentRegionId: hubRegionId,
        status: "ARRIVED",
        timeArrivedAt: new Date(),
      },
    });
  }
}

function hubLabel(stops: RouteStopRow[], regionId: string) {
  const stop = stops.find((s) => s.regionId === regionId);
  return stop
    ? `${stop.region.name} (${stop.region.regionCode})`
    : "hub";
}

async function processScheduledDeparture(
  journey: JourneyWithRoute,
  steps: string[],
) {
  if (!journey.routeId || !journey.vehicleId || !journey.route?.stops.length) {
    return;
  }

  const stops = journey.route.stops;
  let hubId = journey.currentRegionId;

  if (!hubId) {
    const firstStop = getFirstStop(stops);
    if (!firstStop) return;
    hubId = firstStop.regionId;
    await prisma.journey.update({
      where: { id: journey.id },
      data: { currentRegionId: hubId },
    });
  }

  const hubName = hubLabel(stops, hubId);
  const routeCode = journey.route.code ?? journey.routeId;

  const consolidation = await consolidateAtRegion(hubId, journey.routeId);
  appendConsolidationSteps(
    consolidation,
    hubName,
    steps,
    "Consolidated",
  );

  const sealed = await sealNonEmptyOpenBagsAtRegion(hubId, journey.routeId);
  if (sealed > 0) {
    steps.push(`Sealed ${sealed} bag(s) at ${hubName}`);
  }

  const loaded = await loadSealedBagsOntoVehicle(
    journey.vehicleId,
    hubId,
    journey.routeId,
    hubName,
  );

  if (loaded === 0) {
    steps.push(
      `No sealed bags to load at ${hubName} — add packages whose destination is downstream on route ${routeCode}`,
    );
  } else {
    steps.push(`Loaded ${loaded} bag(s) onto vehicle at ${hubName}`);
  }

  await startJourney(journey.id);
  steps.push(`Journey started from ${hubName}`);

  const nextStop = getNextStop(hubId, stops);
  await prisma.journey.update({
    where: { id: journey.id },
    data: {
      nextArrivalAt: nextStop
        ? getSimulatorArrivalTime(
            config.simulator.intervalMs,
            config.simulator.jitterMs,
          )
        : null,
    },
  });
}

async function processInProgressArrival(
  journey: JourneyWithRoute,
  steps: string[],
) {
  if (
    !journey.routeId ||
    !journey.vehicleId ||
    !journey.currentRegionId ||
    !journey.route?.stops.length
  ) {
    return;
  }

  const stops = journey.route.stops;
  const nextStop = getNextStop(journey.currentRegionId, stops);

  if (!nextStop) {
    logger.warn(
      `Journey ${journey.id} has no next stop from ${journey.currentRegionId}`,
    );
    return;
  }

  const nextHubId = nextStop.regionId;
  const hubName = hubLabel(stops, nextHubId);
  const vehicleLabel = journey.vehicle?.vehicleNumber
    ? `vehicle ${journey.vehicle.vehicleNumber}`
    : "vehicle";

  if (isFinalStop(nextHubId, stops)) {
    await unloadAtFinalStop(journey.vehicleId, nextHubId, hubName);
    steps.push(`Arrived at final stop ${hubName} — packages unloaded`);
    await completeJourney(journey.id);
    steps.push(`Journey completed — ${vehicleLabel} is now available`);
    return;
  }

  await unloadAtIntermediateStop(journey.vehicleId, nextHubId, hubName);
  steps.push(`Arrived at ${hubName} — bags unloaded`);

  await prisma.journey.update({
    where: { id: journey.id },
    data: { currentRegionId: nextHubId },
  });

  const consolidation = await consolidateAtRegion(nextHubId, journey.routeId);
  appendConsolidationSteps(
    consolidation,
    hubName,
    steps,
    "Consolidated",
  );

  const sealed = await sealNonEmptyOpenBagsAtRegion(nextHubId, journey.routeId);
  if (sealed > 0) {
    steps.push(`Sealed ${sealed} bag(s) at ${hubName}`);
  }

  const loaded = await loadSealedBagsOntoVehicle(
    journey.vehicleId,
    nextHubId,
    journey.routeId,
    hubName,
  );
  if (loaded > 0) {
    steps.push(`Reloaded ${loaded} bag(s) onto ${vehicleLabel} at ${hubName}`);
  }

  const followingStop = getNextStop(nextHubId, stops);
  await prisma.journey.update({
    where: { id: journey.id },
    data: {
      nextArrivalAt: followingStop
        ? getSimulatorArrivalTime(
            config.simulator.intervalMs,
            config.simulator.jitterMs,
          )
        : null,
    },
  });
}

export type SimulatorTickOptions = {
  /** Manual UI tick — advance immediately without waiting for nextArrivalAt. */
  force?: boolean;
};

export type SimulatorTickResult = {
  processed: number;
  departures: number;
  arrivals: number;
  completed: number;
  errors: string[];
  steps: string[];
};

export async function tick(
  options: SimulatorTickOptions = {},
): Promise<SimulatorTickResult> {
  const now = new Date();
  const result: SimulatorTickResult = {
    processed: 0,
    departures: 0,
    arrivals: 0,
    completed: 0,
    errors: [],
    steps: [],
  };

  const allJourneys = await prisma.journey.findMany({
    where: {
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      ...(options.force
        ? {}
        : {
            OR: [{ nextArrivalAt: { lte: now } }, { nextArrivalAt: null }],
          }),
    },
    include: journeyInclude,
    orderBy: [{ status: "asc" }, { scheduledDepartureAt: "asc" }, { id: "asc" }],
  });

  const journeys = options.force
    ? allJourneys.slice(0, 1)
    : allJourneys;

  if (journeys.length === 0) {
    result.steps.push(
      options.force
        ? "No scheduled or in-progress journeys — create a journey with a route and vehicle first"
        : "No journeys due yet — use Simulate Journey or wait for the scheduled time",
    );
    return result;
  }

  for (const journey of journeys) {
    const routeCode = journey.route?.code ?? journey.routeId ?? "route";
    const vehicleLabel = journey.vehicle?.vehicleNumber
      ? `vehicle ${journey.vehicle.vehicleNumber}`
      : "vehicle";

    try {
      if (journey.status === "SCHEDULED") {
        await processScheduledDeparture(journey as JourneyWithRoute, result.steps);
        result.departures += 1;
        result.steps.unshift(
          `▶ Departure on ${routeCode} (${vehicleLabel})`,
        );
      } else {
        await processInProgressArrival(journey as JourneyWithRoute, result.steps);
        const after = await prisma.journey.findUnique({
          where: { id: journey.id },
          select: { status: true },
        });
        if (after?.status === "COMPLETED") {
          result.completed += 1;
          result.steps.unshift(
            `■ Final arrival on ${routeCode} (${vehicleLabel})`,
          );
        } else {
          result.arrivals += 1;
          result.steps.unshift(
            `● Hub arrival on ${routeCode} (${vehicleLabel})`,
          );
        }
      }
      result.processed += 1;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown simulator error";
      logger.error(`Simulator tick failed for journey ${journey.id}:`, err);
      result.errors.push(`Journey ${journey.id}: ${message}`);
    }
  }

  return result;
}

export async function getSimulationStatus() {
  const now = new Date();
  const activeJourneys = await prisma.journey.findMany({
    where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } },
    include: {
      vehicle: { select: { id: true, vehicleNumber: true } },
      route: { select: { id: true, code: true, name: true } },
      currentRegion: { select: { id: true, regionCode: true, name: true } },
    },
    orderBy: { nextArrivalAt: "asc" },
  });

  return {
    enabled: config.simulator.enabled,
    intervalMs: config.simulator.intervalMs,
    jitterMs: config.simulator.jitterMs,
    now,
    activeJourneys,
    dueCount: activeJourneys.filter(
      (j) => !j.nextArrivalAt || j.nextArrivalAt <= now,
    ).length,
  };
}

export async function getJourneyForSimulation(id: string) {
  return getJourneyById(id);
}
