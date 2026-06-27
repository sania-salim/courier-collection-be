import type { Request, Response, NextFunction } from "express";
import * as externalBusinessService from "../services/externalBusiness";

export async function listExternalBusinesses(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await externalBusinessService.listExternalBusinesses());
  } catch (err) {
    next(err);
  }
}

export async function getExternalBusiness(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await externalBusinessService.getExternalBusinessById(id));
  } catch (err) {
    next(err);
  }
}

export async function getExternalBusinessByCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await externalBusinessService.getExternalBusinessByCode(code));
  } catch (err) {
    next(err);
  }
}
