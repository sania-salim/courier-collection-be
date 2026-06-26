import prisma from "../db/client.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";
import {
  BAG_STATUS,
  COURIER_PACKAGE_STATUS,
  type BAG_STATUS as BagStatus,
} from "../generated/prisma/client.js";

type RegionBagDirection = "from" | "to" | "any";

async function getBagPackageTotals(
  db: Pick<Prisma.TransactionClient, "courierPackage">,
  bagId: string,
) {
  const packages = await db.courierPackage.findMany({
    where: { sealedBagId: bagId },
    select: { weight: true },
  });

  return {
    itemCount: packages.length,
    weight: packages.reduce((sum, pkg) => sum + pkg.weight, 0),
  };
}

async function syncBagTotals(tx: Prisma.TransactionClient, bagId: string) {
  const totals = await getBagPackageTotals(tx, bagId);

  return tx.sealedBag.update({
    where: { id: bagId },
    data: {
      itemCount: totals.itemCount,
      weight: totals.weight,
    },
  });
}

export async function getSealedBagById(id: string) {
  const bag = await prisma.sealedBag.findUnique({
    where: { id },
  });

  if (!bag) {
    throw new NotFoundError(`Sealed bag with id ${id} not found`);
  }

  return bag;
}

export async function listSealedBags() {
  return prisma.sealedBag.findMany({
    orderBy: { id: "asc" },
  });
}

export async function listBagsByStatus(status: BagStatus) {
  return prisma.sealedBag.findMany({
    where: { status },
    orderBy: { id: "asc" },
  });
}

export async function listBagsForRegion(
  regionId: string,
  direction: RegionBagDirection = "any",
) {
  const region = await prisma.region.findUnique({
    where: { id: regionId },
  });

  if (!region) {
    throw new NotFoundError(`Region with id ${regionId} not found`);
  }

  const where: Prisma.SealedBagWhereInput =
    direction === "from"
      ? { fromRegionId: regionId }
      : direction === "to"
        ? { toRegionId: regionId }
        : {
            OR: [{ fromRegionId: regionId }, { toRegionId: regionId }],
          };

  return prisma.sealedBag.findMany({
    where,
    orderBy: { id: "asc" },
  });
}

export async function getBagStatus(id: string): Promise<BagStatus> {
  const bag = await getSealedBagById(id);
  return bag.status;
}

export async function isBagOpen(id: string): Promise<boolean> {
  const status = await getBagStatus(id);
  return status === BAG_STATUS.OPEN;
}

export async function isBagClosed(id: string): Promise<boolean> {
  return !(await isBagOpen(id));
}

export async function getBagItemCount(id: string): Promise<number> {
  await getSealedBagById(id);

  return prisma.courierPackage.count({
    where: { sealedBagId: id },
  });
}

export async function getBagTotalWeight(id: string): Promise<number> {
  await getSealedBagById(id);

  const totals = await getBagPackageTotals(prisma, id);
  return totals.weight;
}

export async function listPackagesInBag(id: string) {
  await getSealedBagById(id);

  return prisma.courierPackage.findMany({
    where: { sealedBagId: id },
    orderBy: { code: "asc" },
  });
}

export async function getBagSummary(id: string) {
  const bag = await prisma.sealedBag.findUnique({
    where: { id },
    include: {
      courierPackages: {
        orderBy: { code: "asc" },
      },
    },
  });

  if (!bag) {
    throw new NotFoundError(`Sealed bag with id ${id} not found`);
  }

  const { courierPackages, ...bagDetails } = bag;
  const totalWeight = courierPackages.reduce((sum, pkg) => sum + pkg.weight, 0);

  return {
    ...bagDetails,
    isOpen: bag.status === BAG_STATUS.OPEN,
    isClosed: bag.status !== BAG_STATUS.OPEN,
    itemCount: courierPackages.length,
    totalWeight,
    packages: courierPackages,
  };
}

export async function createSealedBag(data: Prisma.SealedBagUncheckedCreateInput) {
  return prisma.sealedBag.create({
    data: {
      itemCount: 0,
      weight: 0,
      status: BAG_STATUS.OPEN,
      ...data,
    },
  });
}

export async function updateSealedBag(
  id: string,
  data: Prisma.SealedBagUncheckedUpdateInput,
) {
  await getSealedBagById(id);

  return prisma.sealedBag.update({
    where: { id },
    data,
  });
}

export async function addPackageToBag(bagId: string, packageId: string) {
  return prisma.$transaction(async (tx) => {
    const bag = await tx.sealedBag.findUnique({ where: { id: bagId } });

    if (!bag) {
      throw new NotFoundError(`Sealed bag with id ${bagId} not found`);
    }

    if (bag.status !== BAG_STATUS.OPEN) {
      throw new BadRequestError("Packages can only be added to an open bag");
    }

    const pkg = await tx.courierPackage.findUnique({ where: { id: packageId } });

    if (!pkg) {
      throw new NotFoundError(`Package with id ${packageId} not found`);
    }

    if (pkg.sealedBagId) {
      throw new BadRequestError("Package is already assigned to a bag");
    }

    if (pkg.status !== COURIER_PACKAGE_STATUS.PICKED_UP) {
      throw new BadRequestError("Package must be picked up before it can be added to a bag");
    }

    if (pkg.fromRegionId !== bag.fromRegionId) {
      throw new BadRequestError("Package origin region does not match the bag origin region");
    }

    if (pkg.toRegionId !== bag.toRegionId) {
      throw new BadRequestError("Package destination region does not match the bag destination region");
    }

    await tx.courierPackage.update({
      where: { id: packageId },
      data: {
        sealedBagId: bagId,
        status: COURIER_PACKAGE_STATUS.ADDED_TO_BAG,
      },
    });

    return syncBagTotals(tx, bagId);
  });
}

export async function removePackageFromBag(bagId: string, packageId: string) {
  return prisma.$transaction(async (tx) => {
    const bag = await tx.sealedBag.findUnique({ where: { id: bagId } });

    if (!bag) {
      throw new NotFoundError(`Sealed bag with id ${bagId} not found`);
    }

    if (bag.status !== BAG_STATUS.OPEN) {
      throw new BadRequestError("Packages can only be removed from an open bag");
    }

    const pkg = await tx.courierPackage.findUnique({ where: { id: packageId } });

    if (!pkg) {
      throw new NotFoundError(`Package with id ${packageId} not found`);
    }

    if (pkg.sealedBagId !== bagId) {
      throw new BadRequestError("Package is not in this bag");
    }

    await tx.courierPackage.update({
      where: { id: packageId },
      data: {
        sealedBagId: null,
        status: COURIER_PACKAGE_STATUS.PICKED_UP,
      },
    });

    return syncBagTotals(tx, bagId);
  });
}

export async function sealBag(bagId: string) {
  return prisma.$transaction(async (tx) => {
    const bag = await tx.sealedBag.findUnique({ where: { id: bagId } });

    if (!bag) {
      throw new NotFoundError(`Sealed bag with id ${bagId} not found`);
    }

    if (bag.status !== BAG_STATUS.OPEN) {
      throw new BadRequestError("Only open bags can be sealed");
    }

    const itemCount = await tx.courierPackage.count({
      where: { sealedBagId: bagId },
    });

    if (itemCount === 0) {
      throw new BadRequestError("Cannot seal an empty bag");
    }

    await syncBagTotals(tx, bagId);

    return tx.sealedBag.update({
      where: { id: bagId },
      data: {
        status: BAG_STATUS.SEALED,
        sealedAt: new Date(),
      },
    });
  });
}

export async function assignBagToVehicle(bagId: string, vehicleId: string) {
  return prisma.$transaction(async (tx) => {
    const bag = await tx.sealedBag.findUnique({ where: { id: bagId } });

    if (!bag) {
      throw new NotFoundError(`Sealed bag with id ${bagId} not found`);
    }

    if (bag.status !== BAG_STATUS.SEALED) {
      throw new BadRequestError("Only sealed bags can be assigned to a vehicle");
    }

    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with id ${vehicleId} not found`);
    }

    if (bag.weight > vehicle.capacity) {
      throw new BadRequestError(
        `Bag weight (${bag.weight} kg) exceeds vehicle capacity (${vehicle.capacity} kg)`,
      );
    }

    return tx.sealedBag.update({
      where: { id: bagId },
      data: {
        vehicleId,
        status: BAG_STATUS.LOADED,
        loadedAt: new Date(),
      },
    });
  });
}
