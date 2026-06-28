import prisma from "../db/client.js";
import config from "../config/index.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { getRouteWithStops } from "./route.js";
import { getFirstStop } from "../utils/routeUtils.js";

export const journeyInclude = {
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

export async function listJourneys() {
  return prisma.journey.findMany({
    include: journeyInclude,
    orderBy: { scheduledDepartureAt: "asc" },
  });
}

export async function listActiveJourneys() {
  return prisma.journey.findMany({
    where: { status: "IN_PROGRESS" },
    include: {
      vehicle: true,
      route: true,
    },
    orderBy: { actualDepartureAt: "asc" },
  });
}

export async function listDelayedJourneys() {
  return prisma.journey.findMany({
    where: { isDelayed: true },
    include: {
      vehicle: true,
      route: true,
    },
    orderBy: { scheduledDepartureAt: "asc" },
  });
}

export async function listJourneysByVehicle(vehicleId: string) {
  return prisma.journey.findMany({
    where: { vehicleId },
    include: {
      route: true,
    },
    orderBy: { scheduledDepartureAt: "desc" },
  });
}

export async function listJourneysByRoute(routeId: string) {
  return prisma.journey.findMany({
    where: { routeId },
    include: {
      vehicle: true,
    },
    orderBy: { scheduledDepartureAt: "desc" },
  });
}

export async function getJourneyById(id: string) {
  const journey = await prisma.journey.findUnique({
    where: { id },
    include: journeyInclude,
  });

  if (!journey) {
    throw new NotFoundError(`Journey with id ${id} not found`);
  }

  return journey;
}

type CreateJourneyInput = {
  vehicleId?: string;
  routeId?: string;
  isLocal?: boolean;
  scheduledDepartureAt?: Date;
};

export async function createJourney(input: CreateJourneyInput) {
  if (input.vehicleId) {
    const activeJourney = await prisma.journey.findFirst({
      where: {
        vehicleId: input.vehicleId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
    });

    if (activeJourney) {
      throw new BadRequestError(
        `Vehicle is already assigned to an active journey ${activeJourney.id}`,
      );
    }
  }

  let currentRegionId: string | undefined;
  let nextArrivalAt: Date | undefined;

  if (input.routeId) {
    const route = await getRouteWithStops(input.routeId);
    const firstStop = getFirstStop(route.stops);
    if (firstStop) {
      currentRegionId = firstStop.regionId;
      // Manual simulation advances journeys on demand — no wait timer.
      nextArrivalAt = null;
    }
  }

  return prisma.journey.create({
    data: {
      vehicleId: input.vehicleId,
      routeId: input.routeId,
      isLocal: input.isLocal ?? false,
      scheduledDepartureAt: input.scheduledDepartureAt,
      currentRegionId,
      nextArrivalAt,
    },
    include: {
      vehicle: true,
      route: true,
    },
  });
}

export async function startJourney(id: string) {
  const journey = await getJourneyById(id);

  if (journey.status !== "SCHEDULED") {
    throw new BadRequestError(
      `Journey cannot be started — current status is ${journey.status}`,
    );
  }

  return prisma.journey.update({
    where: { id },
    data: {
      status: "IN_PROGRESS",
      actualDepartureAt: new Date(),
    },
  });
}

export async function delayJourney(id: string, reason: string) {
  const journey = await getJourneyById(id);

  if (!["SCHEDULED", "IN_PROGRESS"].includes(journey.status)) {
    throw new BadRequestError(
      `Journey cannot be delayed — current status is ${journey.status}`,
    );
  }

  if (journey.vehicleId) {
    await prisma.courierPackage.updateMany({
      where: {
        sealedBag: {
          vehicleId: journey.vehicleId,
        },
      },
      data: { status: "DELAYED" },
    });
  }

  return prisma.journey.update({
    where: { id },
    data: {
      isDelayed: true,
      delayReason: reason,
    },
  });
}

export async function rescheduleJourney(id: string, nextDepartureAt: Date) {
  const journey = await getJourneyById(id);

  if (!journey.isDelayed) {
    throw new BadRequestError(`Journey ${id} is not marked as delayed`);
  }

  return prisma.journey.update({
    where: { id },
    data: { nextDepartureAt },
  });
}

export async function completeJourney(id: string) {
  const journey = await getJourneyById(id);

  if (journey.status !== "IN_PROGRESS") {
    throw new BadRequestError(
      `Journey cannot be completed — current status is ${journey.status}`,
    );
  }

  if (journey.vehicleId) {
    await prisma.sealedBag.updateMany({
      where: { vehicleId: journey.vehicleId },
      data: { vehicleId: null },
    });
  }

  return prisma.journey.update({
    where: { id },
    data: {
      status: "COMPLETED",
      isDelayed: false,
      currentRegionId: null,
      nextArrivalAt: null,
    },
  });
}

export async function cancelJourney(id: string) {
  const journey = await getJourneyById(id);

  if (journey.status === "COMPLETED") {
    throw new BadRequestError("Cannot cancel a completed journey");
  }

  if (journey.status === "IN_PROGRESS") {
    throw new BadRequestError("Cannot cancel a journey that is already in progress");
  }

  return prisma.journey.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}
