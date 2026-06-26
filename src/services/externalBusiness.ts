import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";

export async function listExternalBusinesses() {
  return prisma.externalBusiness.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getExternalBusinessById(id: string) {
  const business = await prisma.externalBusiness.findUnique({
    where: { id },
  });

  if (!business) {
    throw new NotFoundError(`External business with id ${id} not found`);
  }

  return business;
}

export async function getExternalBusinessByCode(code: string) {
  const business = await prisma.externalBusiness.findUnique({
    where: { code },
  });

  if (!business) {
    throw new NotFoundError(`External business with code ${code} not found`);
  }

  return business;
}
