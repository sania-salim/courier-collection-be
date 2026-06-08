import { Request, Response, NextFunction } from "express";
import * as packageService from "../services/packageService";

export const createPackage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await packageService.createPackage(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const getAllPackages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const packages = await packageService.getAllPackages();
    res.json(packages);
  } catch (err) {
    next(err);
  }
};

export const updatePackageStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;
    const updated = await packageService.updatePackageStatus(id, status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const getTrackingDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { trackingId } = req.params as { trackingId: string };
    const details = await packageService.getTrackingDetails(trackingId);
    res.json(details);
  } catch (err) {
    next(err);
  }
};
