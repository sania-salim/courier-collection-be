import { z } from "zod";
import { packageStatusSchema, uuidSchema } from "./common";

export const createPackageSchema = z.object({
  front_office_id: z.string().uuid(),
  to_name: z.string().min(1),
  to_address: z.string().min(1),
  to_region_id: z.string().uuid(),
  weight: z.number().positive(),
  current_region_id: z.string().uuid(),
  amount: z.number().nonnegative(),
  payment_method: z.string().min(1),
  receipt_number: z.string().min(1),
});

export const updatePackageStatusSchema = z.object({
  status: packageStatusSchema,
});

export const packageIdParamSchema = z.object({
  id: uuidSchema,
});

export const trackingIdParamSchema = z.object({
  trackingId: uuidSchema,
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
