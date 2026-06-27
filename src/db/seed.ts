import prisma from "./client.js";

const main = async () => {
    console.log("Starting seed...");

    await seedRegions();
    await seedFrontOffices();
    await seedVehicles();

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