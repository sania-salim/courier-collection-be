import type { Request, Response, NextFunction } from "express";
import * as routeService from "../services/route";

export async function listRoutes(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json(await routeService.listRoutes());
  } catch (err) {
    next(err);
  }
}

export async function getRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await routeService.getRouteById(id));
  } catch (err) {
    next(err);
  }
}

export async function getRouteByCode(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await routeService.getRouteByCode(code));
  } catch (err) {
    next(err);
  }
}

export async function getRouteWithStops(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await routeService.getRouteWithStops(id));
  } catch (err) {
    next(err);
  }
}

export async function listRegionsOnRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    res.json(await routeService.listRegionsOnRoute(id));
  } catch (err) {
    next(err);
  }
}

export async function listRoutesThroughRegion(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { regionId } = req.params as { regionId: string };
    res.json(await routeService.listRoutesThroughRegion(regionId));
  } catch (err) {
    next(err);
  }
}

export async function createRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const route = await routeService.createRoute(req.body);
    res.status(201).json(route);
  } catch (err) {
    next(err);
  }
}

export async function updateRoute(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { code } = req.params as { code: string };
    res.json(await routeService.updateRoute(code, req.body));
  } catch (err) {
    next(err);
  }
}

export async function addRouteStop(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const stop = await routeService.addRouteStop(req.body);
    res.status(201).json(stop);
  } catch (err) {
    next(err);
  }
}

export async function getRoadRoute(req: Request, res: Response, next: NextFunction) {
  try {
    const roadRoute = await routeService.getRoadRoute(req.body);
    res.json(roadRoute);
  } catch (err) {
    next(err);
  }
}