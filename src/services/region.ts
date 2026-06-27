import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export async function listRegions() {
  return prisma.region.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getRegionById(id: string) {
  const region = await prisma.region.findUnique({
    where: { id },
  });

  if (!region) {
    throw new NotFoundError(`Region with id ${id} not found`);
  }

  return region;
}

export async function getRegionByCode(regionCode: string) {
  const region = await prisma.region.findUnique({
    where: { regionCode },
  });

  if (!region) {
    throw new NotFoundError(`Region with code ${regionCode} not found`);
  }

  return region;
}

export async function getRegionWithFrontOffices(id: string) {
  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      frontOffices: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!region) {
    throw new NotFoundError(`Region with id ${id} not found`);
  }

  return region;
}
