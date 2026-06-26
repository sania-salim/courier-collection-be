import prisma from "../db/client.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { Prisma } from "../generated/prisma/client.js";

export async function listVehicles() {
  return prisma.vehicle.findMany({
    orderBy: { vehicleNumber: "asc" },
  });
}

export async function listAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { isDelayed: false },
    orderBy: { vehicleNumber: "asc" },
  });
}

export async function listDelayedVehicles() {
  return prisma.vehicle.findMany({
    where: { isDelayed: true },
    orderBy: { vehicleNumber: "asc" },
  });
}

export async function getVehicleById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
  });

  if (!vehicle) {
    throw new NotFoundError(`Vehicle with id ${id} not found`);
  }

  return vehicle;
}

export async function getVehicleByNumber(vehicleNumber: number) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { vehicleNumber },
  });

  if (!vehicle) {
    throw new NotFoundError(`Vehicle with number ${vehicleNumber} not found`);
  }

  return vehicle;
}

export async function getVehicleWithBags(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      sealedBags: {
        orderBy: { id: "asc" },
      },
    },
  });

  if (!vehicle) {
    throw new NotFoundError(`Vehicle with id ${id} not found`);
  }

  return vehicle;
}

export async function hasCapacityForWeight(id: string, weight: number) {
  const vehicle = await getVehicleById(id);
  return weight <= vehicle.capacity;
}

export async function createVehicle(data: Prisma.VehicleUncheckedCreateInput) {
  return prisma.vehicle.create({
    data,
  });
}

export async function updateVehicle(
  id: string,
  data: Prisma.VehicleUncheckedUpdateInput,
) {
  await getVehicleById(id);

  return prisma.vehicle.update({
    where: { id },
    data,
  });
}

export async function markVehicleDelayed(id: string) {
  await getVehicleById(id);

  return prisma.vehicle.update({
    where: { id },
    data: { isDelayed: true },
  });
}

export async function clearVehicleDelay(id: string) {
  await getVehicleById(id);

  return prisma.vehicle.update({
    where: { id },
    data: { isDelayed: false },
  });
}
