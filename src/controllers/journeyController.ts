import type { Request, Response, NextFunction } from "express";
import * as journeyService from "../services/journey";

export async function listJourneys(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await journeyService.listJourneys());
  } catch (err) {
    next(err);
  }
}

export async function listActiveJourneys(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await journeyService.listActiveJourneys());
  } catch (err) {
    next(err);
  }
}

export async function listDelayedJourneys(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await journeyService.listDelayedJourneys());
  } catch (err) {
    next(err);
  }
}

export async function getJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await journeyService.getJourneyById(id));
  } catch (err) {
    next(err);
  }
}

export async function listJourneysByVehicle(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { vehicleId } = req.params as { vehicleId: string };
    res.json(await journeyService.listJourneysByVehicle(vehicleId));
  } catch (err) {
    next(err);
  }
}

export async function listJourneysByRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { routeId } = req.params as { routeId: string };
    res.json(await journeyService.listJourneysByRoute(routeId));
  } catch (err) {
    next(err);
  }
}

export async function createJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const journey = await journeyService.createJourney(req.body);
    res.status(201).json(journey);
  } catch (err) {
    next(err);
  }
}

export async function startJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await journeyService.startJourney(id));
  } catch (err) {
    next(err);
  }
}

export async function delayJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { reason } = req.body as { reason: string };
    res.json(await journeyService.delayJourney(id, reason));
  } catch (err) {
    next(err);
  }
}

export async function rescheduleJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { nextDepartureAt } = req.body as { nextDepartureAt: Date };
    res.json(await journeyService.rescheduleJourney(id, nextDepartureAt));
  } catch (err) {
    next(err);
  }
}

export async function completeJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await journeyService.completeJourney(id));
  } catch (err) {
    next(err);
  }
}

export async function cancelJourney(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await journeyService.cancelJourney(id));
  } catch (err) {
    next(err);
  }
}
