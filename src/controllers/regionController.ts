import type { Request, Response, NextFunction } from "express";
import * as regionService from "../services/region";

export async function listRegions(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await regionService.listRegions());
  } catch (err) {
    next(err);
  }
}

export async function getRegion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await regionService.getRegionById(id));
  } catch (err) {
    next(err);
  }
}

export async function getRegionByCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await regionService.getRegionByCode(code));
  } catch (err) {
    next(err);
  }
}

export async function getRegionWithFrontOffices(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await regionService.getRegionWithFrontOffices(id));
  } catch (err) {
    next(err);
  }
}
