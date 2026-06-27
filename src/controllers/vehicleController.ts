import type { Request, Response, NextFunction } from "express";
import * as vehicleService from "../services/vehicle";

export async function listVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await vehicleService.listVehicles());
  } catch (err) {
    next(err);
  }
}

export async function listAvailableVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await vehicleService.listAvailableVehicles());
  } catch (err) {
    next(err);
  }
}

export async function listDelayedVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await vehicleService.listDelayedVehicles());
  } catch (err) {
    next(err);
  }
}

export async function listUnassignedVehicles(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await vehicleService.listUnassignedVehicles());
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await vehicleService.getVehicleById(id));
  } catch (err) {
    next(err);
  }
}

export async function getVehicleByNumber(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const vehicleNumber = Number(req.params.vehicleNumber);
    res.json(await vehicleService.getVehicleByNumber(vehicleNumber));
  } catch (err) {
    next(err);
  }
}

export async function getVehicleWithBags(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await vehicleService.getVehicleWithBags(id));
  } catch (err) {
    next(err);
  }
}

export async function getVehicleByPackageCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { packageCode } = req.params as { packageCode: string };
    res.json(await vehicleService.getVehicleByPackageCode(packageCode));
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function updateVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await vehicleService.updateVehicle(id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function markVehicleDelayed(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await vehicleService.markVehicleDelayed(id));
  } catch (err) {
    next(err);
  }
}

export async function clearVehicleDelay(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await vehicleService.clearVehicleDelay(id));
  } catch (err) {
    next(err);
  }
}

export async function assignBagToVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { bagId } = req.body as { bagId: string };
    res.json(await vehicleService.assignBagToVehicle(id, bagId));
  } catch (err) {
    next(err);
  }
}
