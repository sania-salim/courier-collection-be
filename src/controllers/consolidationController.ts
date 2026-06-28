import type { Request, Response, NextFunction } from "express";
import { consolidateAtRegion } from "../services/consolidationService";

export async function consolidateRegion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { routeId } = req.query as { routeId?: string };
    res.json(await consolidateAtRegion(id, routeId));
  } catch (err) {
    next(err);
  }
}
