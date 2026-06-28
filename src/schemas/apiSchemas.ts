import { z } from "zod";
import { uuidSchema } from "./common";

export const idParamSchema = z.object({
  id: uuidSchema,
});

export const codeParamSchema = z.object({
  code: z.string().min(1),
});

export const vehicleNumberParamSchema = z.object({
  vehicleNumber: z.coerce.number().int().positive(),
});

export const bagStatusQuerySchema = z.object({
  status: z.enum(["OPEN", "SEALED", "LOADED", "IN_TRANSIT", "ARRIVED"]),
});

export const regionBagsQuerySchema = z.object({
  direction: z.enum(["from", "to", "any"]).optional().default("any"),
});

export const consolidateQuerySchema = z.object({
  routeId: uuidSchema.optional(),
});

export const delayJourneySchema = z.object({
  reason: z.string().min(1),
});

export const rescheduleJourneySchema = z.object({
  nextDepartureAt: z.coerce.date(),
});

export const createJourneySchema = z.object({
  vehicleId: uuidSchema.optional(),
  routeId: uuidSchema.optional(),
  isLocal: z.boolean().optional(),
  scheduledDepartureAt: z.coerce.date().optional(),
});

export const createVehicleSchema = z.object({
  vehicleNumber: z.number().int().positive(),
  capacity: z.number().int().positive(),
});

export const updateVehicleSchema = z.object({
  capacity: z.number().int().positive().optional(),
  isDelayed: z.boolean().optional(),
});

export const assignBagSchema = z.object({
  bagId: uuidSchema,
});

export const createRouteSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
});

export const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
});

export const addRouteStopSchema = z.object({
  routeId: uuidSchema,
  regionId: uuidSchema,
  stopOrder: z.number().int().positive(),
});

export const createPackageSchema = z.object({
  code: z.string().min(1),
  fromRegionId: uuidSchema,
  toRegionId: uuidSchema,
  fromAddressId: uuidSchema,
  toAddress: z.string().min(1),
  weight: z.number().int().nonnegative().optional(),
});

export const createExternalBusinessSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().min(1),
});

export const updatePackageSchema = z.object({
  status: z
    .enum([
      "TO_BE_PICKED_UP",
      "PICKED_UP",
      "ADDED_TO_BAG",
      "EN_ROUTE_TO_REGION",
      "ARRIVED_AT_REGION",
      "SCHEDULED_FOR_DELIVERY",
      "OUT_FOR_DELIVERY",
      "DELAYED",
    ])
    .optional(),
  weight: z.number().int().nonnegative().optional(),
  toAddress: z.string().min(1).optional(),
});

export const createSealedBagSchema = z.object({
  originRegionId: uuidSchema,
  toRegionId: uuidSchema.optional(),
  currentRegionId: uuidSchema.optional(),
  routeId: uuidSchema.optional(),
  maxWeightKg: z.number().int().positive().optional(),
});

export const bagPackageSchema = z.object({
  packageId: uuidSchema,
});

export const assignBagToVehicleSchema = z.object({
  vehicleId: uuidSchema,
});
