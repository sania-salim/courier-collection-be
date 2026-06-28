import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import { listRoutesThroughRegion } from "./route.js";
import {
  addPackageToBag,
  createSealedBag,
  sealBag,
} from "./sealedBag.js";
import {
  getRouteStopsOrdered,
  isDownstreamDest,
  type RouteStopRow,
} from "../utils/routeUtils.js";

export type ConsolidationSummary = {
  regionId: string;
  packagesAdded: number;
  bagsSealed: number;
  bagsUsed: string[];
  skipped: number;
  skipReasons: string[];
};

async function findOpenBag(
  regionId: string,
  routeId: string,
  packageToRegionId: string,
) {
  const bags = await prisma.sealedBag.findMany({
    where: {
      currentRegionId: regionId,
      routeId,
      status: "OPEN",
      OR: [{ toRegionId: null }, { toRegionId: packageToRegionId }],
    },
    orderBy: [{ toRegionId: "asc" }, { id: "asc" }],
  });

  return (
    bags.find((bag) => !bag.toRegionId || bag.toRegionId === packageToRegionId) ??
    null
  );
}

async function createOpenBagForRoute(regionId: string, routeId: string) {
  return createSealedBag({
    originRegionId: regionId,
    currentRegionId: regionId,
    routeId,
    itemCount: 0,
    weight: 0,
  });
}

async function findOrCreateOpenBag(
  regionId: string,
  routeId: string,
  packageToRegionId: string,
) {
  const existing = await findOpenBag(regionId, routeId, packageToRegionId);
  if (existing) return existing;
  return createOpenBagForRoute(regionId, routeId);
}

async function addPackageWithBagCapacity(
  regionId: string,
  routeId: string,
  packageId: string,
  summary: ConsolidationSummary,
) {
  const pkg = await prisma.courierPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return;

  let bag = await findOrCreateOpenBag(regionId, routeId, pkg.toRegionId);
  if (!summary.bagsUsed.includes(bag.id)) {
    summary.bagsUsed.push(bag.id);
  }

  if (bag.weight + pkg.weight > bag.maxWeightKg) {
    if (bag.itemCount > 0) {
      await sealBag(bag.id);
      summary.bagsSealed += 1;
      bag = await createOpenBagForRoute(regionId, routeId);
      summary.bagsUsed.push(bag.id);
    }

    if (pkg.weight > bag.maxWeightKg) {
      summary.skipped += 1;
      summary.skipReasons.push(
        `Package ${pkg.code} (${pkg.weight} kg) exceeds bag limit (${bag.maxWeightKg} kg)`,
      );
      return;
    }
  }

  await addPackageToBag(bag.id, packageId);
  summary.packagesAdded += 1;
}

export async function sealNonEmptyOpenBagsAtRegion(
  regionId: string,
  routeId?: string,
): Promise<number> {
  const bags = await prisma.sealedBag.findMany({
    where: {
      currentRegionId: regionId,
      status: "OPEN",
      itemCount: { gt: 0 },
      ...(routeId ? { routeId } : {}),
    },
  });

  let sealed = 0;
  for (const bag of bags) {
    await sealBag(bag.id);
    sealed += 1;
  }
  return sealed;
}

export async function consolidateAtRegion(
  regionId: string,
  routeId?: string,
): Promise<ConsolidationSummary> {
  const region = await prisma.region.findUnique({ where: { id: regionId } });
  if (!region) {
    throw new NotFoundError(`Region with id ${regionId} not found`);
  }

  const summary: ConsolidationSummary = {
    regionId,
    packagesAdded: 0,
    bagsSealed: 0,
    bagsUsed: [],
    skipped: 0,
    skipReasons: [],
  };

  const eligiblePackages = await prisma.courierPackage.findMany({
    where: {
      currentRegionId: regionId,
      sealedBagId: null,
      status: { in: ["TO_BE_PICKED_UP", "PICKED_UP", "ARRIVED_AT_REGION"] },
    },
    orderBy: { createdAt: "asc" },
  });

  if (eligiblePackages.length === 0) {
    return summary;
  }

  const routes = routeId
    ? [{ id: routeId }]
    : await listRoutesThroughRegion(regionId);

  const stopsByRoute = new Map<string, RouteStopRow[]>();
  for (const route of routes) {
    stopsByRoute.set(route.id, await getRouteStopsOrdered(route.id));
  }

  for (const pkg of eligiblePackages) {
    let assigned = false;

    for (const route of routes) {
      const stops = stopsByRoute.get(route.id);
      if (!stops) continue;

      if (!isDownstreamDest(pkg.toRegionId, regionId, stops)) {
        continue;
      }

      await addPackageWithBagCapacity(regionId, route.id, pkg.id, summary);
      assigned = true;
      break;
    }

    if (!assigned) {
      summary.skipped += 1;
      summary.skipReasons.push(
        `Package ${pkg.code}: no route through this hub with destination downstream of current stop`,
      );
    }
  }

  return summary;
}
