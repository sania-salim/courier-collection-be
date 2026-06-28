import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";
import { recordPackageScan } from "./packageScanLog.js";

export async function getPackageByCode(code: string) {
    const courierPackage = await prisma.courierPackage.findUnique({
        where: { code },
    });

    if (!courierPackage) {
        throw new NotFoundError(`Package with code ${code} not found`);
    }

    return courierPackage;
}

export async function listPackages() {
    return prisma.courierPackage.findMany();
}

export async function createPackage(data: Prisma.CourierPackageUncheckedCreateInput) {
    const currentRegionId = data.currentRegionId ?? data.fromRegionId;
    const status = data.status ?? "TO_BE_PICKED_UP";

    return prisma.$transaction(async (tx) => {
        const pkg = await tx.courierPackage.create({
            data: {
                ...data,
                currentRegionId,
                status,
            },
        });

        await recordPackageScan(
            {
                packageId: pkg.id,
                regionId: currentRegionId,
                status: pkg.status,
                notes: "Package registered at hub",
                scannedAt: pkg.createdAt,
            },
            tx,
        );

        return pkg;
    });
}

export async function updatePackage(code: string, data: Prisma.CourierPackageUncheckedUpdateInput) {
    return prisma.$transaction(async (tx) => {
        const existing = await tx.courierPackage.findUnique({ where: { code } });

        if (!existing) {
            throw new NotFoundError(`Package with code ${code} not found`);
        }

        const pkg = await tx.courierPackage.update({
            where: { code },
            data,
        });

        const statusChanged = data.status !== undefined && data.status !== existing.status;
        const regionChanged =
            data.currentRegionId !== undefined &&
            data.currentRegionId !== existing.currentRegionId;

        if (statusChanged || regionChanged) {
            await recordPackageScan(
                {
                    packageId: pkg.id,
                    regionId: pkg.currentRegionId,
                    status: pkg.status,
                    notes: statusChanged
                        ? `Status updated to ${pkg.status}`
                        : "Location updated",
                },
                tx,
            );
        }

        return pkg;
    });
}