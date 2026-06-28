import type { Request, Response, NextFunction } from "express";
import {
  getSimulationStatus,
  tick,
} from "../services/routeSimulatorService";

export async function runSimulationTick(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const force = req.query.force !== "false";
    res.json(await tick({ force }));
  } catch (err) {
    next(err);
  }
}

export async function getStatus(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await getSimulationStatus());
  } catch (err) {
    next(err);
  }
}
