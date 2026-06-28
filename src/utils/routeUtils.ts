import { getRouteWithStops } from "../services/route.js";

export type RouteStopRow = {
  id: string;
  stopOrder: number;
  routeId: string;
  regionId: string;
  region: {
    id: string;
    name: string;
    regionCode: string;
  };
};

export async function getRouteStopsOrdered(
  routeId: string,
): Promise<RouteStopRow[]> {
  const route = await getRouteWithStops(routeId);
  return route.stops;
}

export function getStopOrder(
  regionId: string,
  stops: RouteStopRow[],
): number | null {
  const stop = stops.find((s) => s.regionId === regionId);
  return stop?.stopOrder ?? null;
}

export function getFirstStop(stops: RouteStopRow[]): RouteStopRow | null {
  if (stops.length === 0) return null;
  return stops.reduce((first, stop) =>
    stop.stopOrder < first.stopOrder ? stop : first,
  );
}

export function getNextStop(
  currentRegionId: string,
  stops: RouteStopRow[],
): RouteStopRow | null {
  const currentOrder = getStopOrder(currentRegionId, stops);
  if (currentOrder === null) return null;

  return (
    stops
      .filter((stop) => stop.stopOrder > currentOrder)
      .sort((a, b) => a.stopOrder - b.stopOrder)[0] ?? null
  );
}

export function isRegionOnRoute(
  regionId: string,
  stops: RouteStopRow[],
): boolean {
  return stops.some((stop) => stop.regionId === regionId);
}

export function isDownstreamDest(
  destRegionId: string,
  currentRegionId: string,
  stops: RouteStopRow[],
): boolean {
  const currentOrder = getStopOrder(currentRegionId, stops);
  const destOrder = getStopOrder(destRegionId, stops);

  if (currentOrder === null || destOrder === null) return false;

  return destOrder > currentOrder;
}

export function isFinalStop(
  regionId: string,
  stops: RouteStopRow[],
): boolean {
  if (stops.length === 0) return false;
  const lastStop = stops.reduce((last, stop) =>
    stop.stopOrder > last.stopOrder ? stop : last,
  );
  return lastStop.regionId === regionId;
}

export function getSimulatorArrivalTime(
  intervalMs: number,
  jitterMs: number,
): Date {
  const jitter = jitterMs > 0 ? Math.floor(Math.random() * jitterMs) : 0;
  return new Date(Date.now() + intervalMs + jitter);
}
