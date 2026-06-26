import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";

const routeWithStopsInclude = {
  stops: {
    orderBy: { stopOrder: "asc" as const },
    include: {
      region: true,
    },
  },
};

export async function listRoutes() {
  return prisma.route.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getRouteById(id: string) {
  const route = await prisma.route.findUnique({
    where: { id },
  });

  if (!route) {
    throw new NotFoundError(`Route with id ${id} not found`);
  }

  return route;
}

export async function getRouteByCode(code: string) {
  const route = await prisma.route.findUnique({
    where: { code },
  });

  if (!route) {
    throw new NotFoundError(`Route with code ${code} not found`);
  }

  return route;
}

export async function getRouteWithStops(id: string) {
  const route = await prisma.route.findUnique({
    where: { id },
    include: routeWithStopsInclude,
  });

  if (!route) {
    throw new NotFoundError(`Route with id ${id} not found`);
  }

  return route;
}

export async function getRouteWithStopsByCode(code: string) {
  const route = await prisma.route.findUnique({
    where: { code },
    include: routeWithStopsInclude,
  });

  if (!route) {
    throw new NotFoundError(`Route with code ${code} not found`);
  }

  return route;
}

export async function listRegionsOnRoute(routeId: string) {
  await getRouteById(routeId);

  const stops = await prisma.routeStop.findMany({
    where: { routeId },
    orderBy: { stopOrder: "asc" },
    select: { region: true },
  });

  return stops.map((stop) => stop.region);
}

export async function routeHasRegion(routeId: string, regionId: string) {
  const stop = await prisma.routeStop.findUnique({
    where: {
      routeId_regionId: { routeId, regionId },
    },
  });

  return stop !== null;
}

export async function listRoutesThroughRegion(regionId: string) {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
  });

  if (!region) {
    throw new NotFoundError(`Region with id ${regionId} not found`);
  }

  const stops = await prisma.routeStop.findMany({
    where: { regionId },
    include: { route: true },
    orderBy: { route: { name: "asc" } },
  });

  return stops.map((stop) => stop.route);
}

export async function listRoutesThroughRegionCode(regionCode: string) {
  const region = await prisma.region.findUnique({
    where: { regionCode },
  });

  if (!region) {
    throw new NotFoundError(`Region with code ${regionCode} not found`);
  }

  return listRoutesThroughRegion(region.id);
}

export async function createRoute(data: Prisma.RouteUncheckedCreateInput) {
  return prisma.route.create({
    data,
  });
}

export async function updateRoute(
  code: string,
  data: Prisma.RouteUncheckedUpdateInput,
) {
  await getRouteByCode(code);

  return prisma.route.update({
    where: { code },
    data,
  });
}

export async function addRouteStop(data: Prisma.RouteStopUncheckedCreateInput) {
  await getRouteById(data.routeId);

  const region = await prisma.region.findUnique({
    where: { id: data.regionId },
  });

  if (!region) {
    throw new NotFoundError(`Region with id ${data.regionId} not found`);
  }

  return prisma.routeStop.create({
    data,
    include: {
      region: true,
    },
  });
}

export async function updateRouteStop(
  id: string,
  data: Prisma.RouteStopUncheckedUpdateInput,
) {
  const stop = await prisma.routeStop.findUnique({
    where: { id },
  });

  if (!stop) {
    throw new NotFoundError(`Route stop with id ${id} not found`);
  }

  return prisma.routeStop.update({
    where: { id },
    data,
    include: {
      region: true,
    },
  });
}
