import type { Request, Response, NextFunction } from "express";
import * as packageService from "../services/package";

export async function listPackages(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await packageService.listPackages());
  } catch (err) {
    next(err);
  }
}

export async function getPackage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await packageService.getPackageByCode(code));
  } catch (err) {
    next(err);
  }
}

export async function createPackage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pkg = await packageService.createPackage(req.body);
    res.status(201).json(pkg);
  } catch (err) {
    next(err);
  }
}

export async function updatePackage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await packageService.updatePackage(code, req.body));
  } catch (err) {
    next(err);
  }
}
