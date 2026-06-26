import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";

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
    return prisma.courierPackage.create({
        data,
    });
}

export async function updatePackage(code: string, data: Prisma.CourierPackageUncheckedUpdateInput) {
    return prisma.courierPackage.update({
        where: { code },
        data,
    });
}