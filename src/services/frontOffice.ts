import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export async function listFrontOffices() {
  return prisma.frontOffice.findMany({
    orderBy: { name: "asc" },
    include: {
      region: true,
    },
  });
}

export async function getFrontOfficeById(id: string) {
  const frontOffice = await prisma.frontOffice.findUnique({
    where: { id },
    include: {
      region: true,
    },
  });

  if (!frontOffice) {
    throw new NotFoundError(`Front office with id ${id} not found`);
  }

  return frontOffice;
}

export async function getFrontOfficeByCode(code: string) {
  const frontOffice = await prisma.frontOffice.findUnique({
    where: { code },
    include: {
      region: true,
    },
  });

  if (!frontOffice) {
    throw new NotFoundError(`Front office with code ${code} not found`);
  }

  return frontOffice;
}

export async function listFrontOfficesByRegionId(regionId: string) {
  return prisma.frontOffice.findMany({
    where: { regionId },
    orderBy: { name: "asc" },
  });
}

export async function listFrontOfficesByRegionCode(regionCode: string) {
  const region = await prisma.region.findUnique({
    where: { regionCode },
  });

  if (!region) {
    throw new NotFoundError(`Region with code ${regionCode} not found`);
  }

  return prisma.frontOffice.findMany({
    where: { regionId: region.id },
    orderBy: { name: "asc" },
  });
}
