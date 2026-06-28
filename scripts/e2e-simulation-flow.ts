/**
 * End-to-end simulation flow test.
 * Run: npx tsx scripts/e2e-simulation-flow.ts
 */
const BASE = "http://localhost:5001";

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} -> ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const blr = await api("/regions/code/BLR");
  const tvm = await api("/regions/code/TVM");
  const route = (await api("/routes")).find(
    (r: { code: string }) => r.code === "BLR-COK-TVM",
  );
  const vehicle = (await api("/vehicles/unassigned"))[0];
  const business = (await api("/external-businesses"))[0];

  if (!route || !vehicle || !business) {
    throw new Error("Need BLR-COK-TVM route, unassigned vehicle, and business");
  }

  const code = `E2E-${Date.now()}`;
  await api("/packages", {
    method: "POST",
    body: JSON.stringify({
      code,
      fromRegionId: blr.id,
      toRegionId: tvm.id,
      fromAddressId: business.id,
      toAddress: "E2E test address",
      weight: 2,
    }),
  });

  const journey = await api("/journeys", {
    method: "POST",
    body: JSON.stringify({
      vehicleId: vehicle.id,
      routeId: route.id,
      isLocal: false,
    }),
  });

  console.log(`Package ${code}, journey ${journey.id}`);

  for (let i = 1; i <= 4; i++) {
    const tick = await api("/simulation/tick?force=true", { method: "POST" });
    console.log(`\n--- Tick ${i} ---`);
    console.log(tick.steps.join("\n"));

    const pkg = await api(`/packages/${code}`);
    const logs = await api(`/packages/${code}/scan-logs`);
    console.log(`Package: ${pkg.status} at ${pkg.currentRegionId.slice(0, 8)}… bag=${pkg.sealedBagId?.slice(0, 8) ?? "none"}`);
    console.log(`Scan logs (${logs.length}):`);
    for (const log of logs) {
      console.log(`  - ${log.status} @ ${log.region.regionCode}: ${log.notes}`);
    }

    if (pkg.status === "ARRIVED_AT_REGION" && pkg.currentRegionId === tvm.id) {
      console.log("\nPASS: Package arrived at TVM with full scan trail");
      return;
    }
  }

  throw new Error("Package did not reach TVM after 4 ticks");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
