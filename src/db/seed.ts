import prisma from "./client.js";

/** Fixed IDs so re-running seed resets demo bags to OPEN without manual DB cleanup. */
const DEMO_ROUTE_ID = "22222222-1111-4111-8111-111111111001";

const SEED_ROUTES = [
    {
        id: DEMO_ROUTE_ID,
        code: "BLR-COK-TVM",
        name: "Bangalore to Trivandrum via Kochi",
        stopCodes: ["BLR", "COK", "TVM"],
    },
    {
        id: "22222222-1111-4111-8111-111111111002",
        code: "BLR-TVM-001",
        name: "Bangalore-Trivandrum-expressway",
        stopCodes: ["BLR", "SXE", "COK", "TVM"],
    },
    {
        id: "22222222-1111-4111-8111-111111111003",
        code: "BLR-MAA-001",
        name: "Bangalore-Chennai-primary",
        stopCodes: ["BLR", "MAA"],
    },
    {
        id: "22222222-1111-4111-8111-111111111004",
        code: "COK-MAA-001",
        name: "Kochi-Chennai",
        stopCodes: ["COK", "SXE", "MAA"],
    },
    {
        id: "22222222-1111-4111-8111-111111111005",
        code: "COK-SXE-MAA",
        name: "Kochi-Salem-Chennai",
        stopCodes: ["COK", "SXE", "MAA"],
    },
    {
        id: "22222222-1111-4111-8111-111111111006",
        code: "TVM-02",
        name: "Trivandrum Circle",
        stopCodes: ["TVM", "COK", "BLR", "SXE", "MAA"],
    },
    {
        id: "22222222-1111-4111-8111-111111111007",
        code: "MAA-02",
        name: "Chennai Circle",
        stopCodes: ["MAA", "SXE", "COK", "TVM", "BLR"],
    },
] as const;

/** One open demo bag per route: at first stop, destined for last stop on that route. */
const SEED_BAGS = SEED_ROUTES.map((route, index) => ({
    id: `11111111-1111-4111-8111-1111111111${String(index + 1).padStart(2, "0")}`,
    routeCode: route.code,
    fromRegionCode: route.stopCodes[0],
    toRegionCode: route.stopCodes[route.stopCodes.length - 1],
}));

const assertDatabaseReachable = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        throw new Error(
            "Cannot reach the database. Start Postgres first:\n" +
                "  docker compose up -d\n" +
                "Then run:\n" +
                "  npm run seed",
        );
    }
};

const main = async () => {
    console.log("Starting seed...");

    await assertDatabaseReachable();
    await seedRegions();
    await seedFrontOffices();
    await seedVehicles();
    await seedRoutes();
    await seedSealedBags();

    console.log("Seed complete");
};

const seedRegions = async () => {
    await prisma.region.createMany({
        data: [
            {
                name: "Bangalore",
                regionCode: "BLR",
                locationLatitude: 12.9716,
                locationLongitude: 77.5946,
            },
            {
                name: "Trivandrum",
                regionCode: "TVM",
                locationLatitude: 8.5241,
                locationLongitude: 76.9366,
            },
            {
                name: "Kochi",
                regionCode: "COK",
                locationLatitude: 9.9312,
                locationLongitude: 76.2673,
            },
            {
                name: "Chennai",
                regionCode: "MAA",
                locationLatitude: 13.0827,
                locationLongitude: 80.2707,
            },
            {
                name: "Salem",
                regionCode: "SXE",
                locationLatitude: 11.6643,
                locationLongitude: 78.1460,
            },
        ],
        skipDuplicates: true,
    });

    console.log("Regions seeded");
};

const seedFrontOffices = async () => {
    const bangalore = await prisma.region.findUnique({
        where: { regionCode: "BLR" },
    });
    const trivandrum = await prisma.region.findUnique({
        where: { regionCode: "TVM" },
    });
    const kochi = await prisma.region.findUnique({
        where: { regionCode: "COK" },
    });
    const chennai = await prisma.region.findUnique({
        where: { regionCode: "MAA" },
    });
    const salem = await prisma.region.findUnique({
        where: { regionCode: "SXE" },
    });

    if (!bangalore || !trivandrum || !kochi || !chennai || !salem) {
        throw new Error("Regions must be seeded before front offices");
    }

    await prisma.frontOffice.createMany({
        data: [
            { name: "Bangalore Central", code: "BLR-FO-01", regionId: bangalore.id },
            { name: "Bangalore East", code: "BLR-FO-02", regionId: bangalore.id },
            { name: "Trivandrum Main", code: "TVM-FO-01", regionId: trivandrum.id },
            { name: "Kochi Main", code: "COK-FO-01", regionId: kochi.id },
            { name: "Kochi North", code: "COK-FO-02", regionId: kochi.id },
            { name: "Chennai Central", code: "MAA-FO-01", regionId: chennai.id },
            { name: "Chennai South", code: "MAA-FO-02", regionId: chennai.id },
            { name: "Salem Main", code: "SXE-FO-01", regionId: salem.id },
        ],
        skipDuplicates: true,
    });

    console.log("Front offices seeded");
};

const seedVehicles = async () => {
    await prisma.vehicle.createMany({
        data: [
            { vehicleNumber: 1001, capacity: 1000 },
            { vehicleNumber: 1002, capacity: 1000 },
            { vehicleNumber: 1003, capacity: 2000 },
            { vehicleNumber: 1004, capacity: 2000 },
            { vehicleNumber: 1005, capacity: 500 },
        ],
        skipDuplicates: true,
    });

    console.log("Vehicles seeded");
};

const seedRoutes = async () => {
    const regions = await prisma.region.findMany();
    const regionByCode = new Map(
        regions.map((region) => [region.regionCode, region]),
    );

    for (const route of SEED_ROUTES) {
        const savedRoute = await prisma.route.upsert({
            where: { code: route.code },
            create: {
                id: route.id,
                name: route.name,
                code: route.code,
            },
            update: {
                name: route.name,
            },
        });

        for (const [index, stopCode] of route.stopCodes.entries()) {
            const region = regionByCode.get(stopCode);
            if (!region) {
                throw new Error(
                    `Region ${stopCode} must exist before seeding route ${route.code}`,
                );
            }

            await prisma.routeStop.upsert({
                where: {
                    routeId_regionId: {
                        routeId: savedRoute.id,
                        regionId: region.id,
                    },
                },
                create: {
                    routeId: savedRoute.id,
                    regionId: region.id,
                    stopOrder: index + 1,
                },
                update: { stopOrder: index + 1 },
            });
        }
    }

    console.log(`Routes seeded (${SEED_ROUTES.length})`);
};

const seedSealedBags = async () => {
    const regions = await prisma.region.findMany();
    const regionByCode = new Map(regions.map((region) => [region.regionCode, region]));
    const routes = await prisma.route.findMany({
        where: { code: { in: SEED_BAGS.map((bag) => bag.routeCode) } },
    });
    const routeByCode = new Map(routes.map((route) => [route.code, route]));

    for (const bag of SEED_BAGS) {
        const fromRegion = regionByCode.get(bag.fromRegionCode);
        const toRegion = regionByCode.get(bag.toRegionCode);
        const route = routeByCode.get(bag.routeCode);

        if (!fromRegion || !toRegion) {
            throw new Error("Regions must be seeded before sealed bags");
        }
        if (!route) {
            throw new Error(
                `Route ${bag.routeCode} must be seeded before sealed bags`,
            );
        }

        await prisma.sealedBag.upsert({
            where: { id: bag.id },
            create: {
                id: bag.id,
                originRegionId: fromRegion.id,
                currentRegionId: fromRegion.id,
                toRegionId: toRegion.id,
                routeId: route.id,
                maxWeightKg: 5,
                itemCount: 0,
                weight: 0,
            },
            update: {
                originRegionId: fromRegion.id,
                currentRegionId: fromRegion.id,
                toRegionId: toRegion.id,
                routeId: route.id,
                maxWeightKg: 5,
                itemCount: 0,
                weight: 0,
                status: "OPEN",
                vehicleId: null,
                sealedAt: null,
                loadedAt: null,
                timeArrivedAt: null,
            },
        });
    }

    const removed = await prisma.sealedBag.deleteMany({
        where: {
            id: { notIn: SEED_BAGS.map((bag) => bag.id) },
            courierPackages: { none: {} },
        },
    });

    if (removed.count > 0) {
        console.log(`Removed ${removed.count} old demo sealed bag(s)`);
    }

    console.log(`Sealed bags seeded (${SEED_BAGS.length})`);
};

// This is the entry point
// main() runs, and when it finishes (or fails)
// prisma disconnects from the DB
main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });