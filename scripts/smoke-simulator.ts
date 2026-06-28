/**
 * Manual smoke test for consolidation + route simulator.
 * Run: npx tsx scripts/smoke-simulator.ts
 */
import prisma from "../src/db/client.js";

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
  console.log("=== 1. Simulation status ===");
  const statusBefore = await api("/simulation/status");
  console.log(
    `Active journeys: ${statusBefore.activeJourneys.length}, due: ${statusBefore.dueCount}`,
  );

  const blr = await api("/regions/code/BLR");
  const tvm = await api("/regions/code/TVM");
  const routes = await api("/routes");
  const demoRoute = routes.find((r: { code: string }) => r.code === "BLR-COK-TVM");
  const businesses = await api("/external-businesses");
  const business = businesses[0];

  if (!demoRoute || !business) {
    throw new Error("Missing demo route or external business");
  }

  console.log("\n=== 2. Create package + consolidate ===");
  const code = `SMOKE-${Date.now()}`;
  const pkg = await api("/packages", {
    method: "POST",
    body: JSON.stringify({
      code,
      fromRegionId: blr.id,
      toRegionId: tvm.id,
      fromAddressId: business.id,
      toAddress: "TVM smoke test",
      weight: 2,
    }),
  });

  await api(`/packages/${code}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "PICKED_UP" }),
  });

  const consolidate = await api(
    `/regions/${blr.id}/consolidate?routeId=${demoRoute.id}`,
    { method: "POST" },
  );
  console.log("Consolidation:", consolidate);

  console.log("\n=== 3. Force demo journey due and run simulator ticks ===");
  const demoJourneyId = "33333333-1111-4111-8111-111111111001";

  await prisma.journey.updateMany({
    where: {
      vehicle: { vehicleNumber: 1001 },
      id: { not: demoJourneyId },
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
    },
    data: { status: "CANCELLED" },
  });

  let journey = await prisma.journey.findUnique({ where: { id: demoJourneyId } });
  if (!journey) {
    throw new Error("Demo journey not found — run npm run seed");
  }

  for (let leg = 1; leg <= 3; leg += 1) {
    await prisma.journey.update({
      where: { id: demoJourneyId },
      data: { nextArrivalAt: new Date(Date.now() - 1000) },
    });

    const tick = await api("/simulation/tick", { method: "POST" });
    console.log(`Tick ${leg}:`, tick);

    journey = await prisma.journey.findUnique({ where: { id: demoJourneyId } });
    console.log(`Journey status after tick ${leg}:`, journey?.status, journey?.currentRegionId);

    if (journey?.status === "COMPLETED") {
      break;
    }
  }

  console.log("\n=== 4. Vehicle 1001 unassigned? ===");
  const unassigned = await api("/vehicles/unassigned");
  const vehicle1001 = unassigned.find(
    (v: { vehicleNumber: number }) => v.vehicleNumber === 1001,
  );
  console.log(
    vehicle1001
      ? "PASS: Vehicle 1001 appears in /vehicles/unassigned"
      : "FAIL: Vehicle 1001 not in unassigned list",
  );

  const finalStatus = await api("/simulation/status");
  console.log(
    `\nFinal active journeys on vehicle 1001:`,
    finalStatus.activeJourneys.filter(
      (j: { vehicle?: { vehicleNumber: number } }) => j.vehicle?.vehicleNumber === 1001,
    ).length,
  );
}

main()
  .catch((err) => {
    console.error("Smoke test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
