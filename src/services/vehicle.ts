import prisma from "../db/client.js";
import { BadRequestError } from "../errors/BadRequestError.js";
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

export async function getVehicleByPackageCode(packageCode: string) {
  const courierPackage = await prisma.courierPackage.findUnique({
    where: { code: packageCode },
    include: {
      sealedBag: {
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!courierPackage) {
    throw new NotFoundError(`Package with code ${packageCode} not found`);
  }

  if (!courierPackage.sealedBag?.vehicle) {
    throw new NotFoundError(
      `Package ${packageCode} is not currently assigned to a vehicle`
    );
  }

  return courierPackage.sealedBag.vehicle;
}

export async function listUnassignedVehicles() {
  return prisma.vehicle.findMany({
    where: {
      journeys: {
        none: {
          status: {
            in: ["SCHEDULED", "IN_PROGRESS"],
          },
        },
      },
    },
    orderBy: { vehicleNumber: "asc" },
  });
}


export async function assignBagToVehicle(
  vehicleId: string,
  bagId: string,
) {
  // Get vehicle with its current bags
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    include: {
      sealedBags: true,
    },
  });

  if (!vehicle) {
    throw new NotFoundError(`Vehicle with id ${vehicleId} not found`);
  }


  const bag = await prisma.sealedBag.findUnique({
    where: { id: bagId },
  });

  if (!bag) {
    throw new NotFoundError(`Bag with id ${bagId} not found`);
  }


  const currentWeight = vehicle.sealedBags.reduce(
    (sum, b) => sum + b.weight,
    0
  );


  if (currentWeight + bag.weight > vehicle.capacity) {
    throw new BadRequestError(
      `Cannot assign bag — would exceed vehicle capacity. ` +
        `Current: ${currentWeight}kg, Bag: ${bag.weight}kg, ` +
        `Capacity: ${vehicle.capacity}kg`,
    );
  }


  return prisma.sealedBag.update({
    where: { id: bagId },
    data: {
      vehicleId,
      status: "LOADED",
    },
  });
}
