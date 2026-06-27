import type { Request, Response, NextFunction } from "express";
import * as sealedBagService from "../services/sealedBag";
import type { BAG_STATUS } from "../generated/prisma/client";

export async function listSealedBags(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await sealedBagService.listSealedBags());
  } catch (err) {
    next(err);
  }
}

export async function listBagsByStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status } = req.query as { status: BAG_STATUS };
    res.json(await sealedBagService.listBagsByStatus(status));
  } catch (err) {
    next(err);
  }
}

export async function listBagsForRegion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { regionId } = req.params as { regionId: string };
    const { direction } = req.query as {
      direction?: "from" | "to" | "any";
    };
    res.json(
      await sealedBagService.listBagsForRegion(regionId, direction ?? "any"),
    );
  } catch (err) {
    next(err);
  }
}

export async function getSealedBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await sealedBagService.getSealedBagById(id));
  } catch (err) {
    next(err);
  }
}

export async function getBagSummary(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await sealedBagService.getBagSummary(id));
  } catch (err) {
    next(err);
  }
}

export async function listPackagesInBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await sealedBagService.listPackagesInBag(id));
  } catch (err) {
    next(err);
  }
}

export async function createSealedBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const bag = await sealedBagService.createSealedBag(req.body);
    res.status(201).json(bag);
  } catch (err) {
    next(err);
  }
}

export async function addPackageToBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { packageId } = req.body as { packageId: string };
    res.json(await sealedBagService.addPackageToBag(id, packageId));
  } catch (err) {
    next(err);
  }
}

export async function removePackageFromBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { packageId } = req.body as { packageId: string };
    res.json(await sealedBagService.removePackageFromBag(id, packageId));
  } catch (err) {
    next(err);
  }
}

export async function sealBag(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await sealedBagService.sealBag(id));
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
    const { vehicleId } = req.body as { vehicleId: string };
    res.json(await sealedBagService.assignBagToVehicle(id, vehicleId));
  } catch (err) {
    next(err);
  }
}
