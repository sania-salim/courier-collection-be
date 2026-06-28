import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";
import type { COURIER_PACKAGE_STATUS } from "../generated/prisma/client.js";
import { getPackageByCode } from "./package.js";

type RecordScanInput = {
  packageId: string;
  regionId: string;
  status: COURIER_PACKAGE_STATUS;
  notes?: string;
  scannedAt?: Date;
};

export async function recordPackageScan(
  input: RecordScanInput,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  return db.packageScanLog.create({
    data: {
      packageId: input.packageId,
      regionId: input.regionId,
      status: input.status,
      notes: input.notes,
      scannedAt: input.scannedAt ?? new Date(),
    },
  });
}

export async function listScanLogsForPackageId(packageId: string) {
  return prisma.packageScanLog.findMany({
    where: { packageId },
    include: {
      region: {
        select: {
          id: true,
          name: true,
          regionCode: true,
        },
      },
    },
    orderBy: { scannedAt: "asc" },
  });
}

export async function listScanLogsForPackageCode(code: string) {
  const pkg = await getPackageByCode(code);
  return listScanLogsForPackageId(pkg.id);
}

export async function applyPackageMovement(
  packageId: string,
  data: Prisma.CourierPackageUncheckedUpdateInput,
  notes: string,
  db: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const pkg = await db.courierPackage.update({
    where: { id: packageId },
    data,
  });

  await recordPackageScan(
    {
      packageId: pkg.id,
      regionId: pkg.currentRegionId,
      status: pkg.status,
      notes,
    },
    db,
  );

  return pkg;
}

export async function backfillScanLogForPackage(packageId: string) {
  const pkg = await prisma.courierPackage.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    throw new NotFoundError(`Package with id ${packageId} not found`);
  }

  const existing = await prisma.packageScanLog.count({
    where: { packageId },
  });

  if (existing > 0) {
    return listScanLogsForPackageId(packageId);
  }

  await recordPackageScan({
    packageId: pkg.id,
    regionId: pkg.fromRegionId,
    status: "TO_BE_PICKED_UP",
    notes: "Package registered at hub",
    scannedAt: pkg.createdAt,
  });

  return listScanLogsForPackageId(packageId);
}
