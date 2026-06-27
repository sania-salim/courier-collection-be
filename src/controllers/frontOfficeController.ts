import type { Request, Response, NextFunction } from "express";
import * as frontOfficeService from "../services/frontOffice";

export async function listFrontOffices(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await frontOfficeService.listFrontOffices());
  } catch (err) {
    next(err);
  }
}

export async function getFrontOffice(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await frontOfficeService.getFrontOfficeById(id));
  } catch (err) {
    next(err);
  }
}

export async function getFrontOfficeByCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await frontOfficeService.getFrontOfficeByCode(code));
  } catch (err) {
    next(err);
  }
}

export async function listFrontOfficesByRegion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { regionId } = req.params as { regionId: string };
    res.json(await frontOfficeService.listFrontOfficesByRegionId(regionId));
  } catch (err) {
    next(err);
  }
}
