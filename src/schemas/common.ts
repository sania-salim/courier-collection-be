import { z } from "zod";

export const packageStatusSchema = z.enum([
  "to_be_picked_up",
  "picked_up",
  "in_transit",
  "arrived",
  "delayed",
  "out_for_delivery",
  "delivered",
]);

export const uuidSchema = z.string().uuid();
