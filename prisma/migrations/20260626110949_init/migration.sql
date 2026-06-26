-- CreateEnum
CREATE TYPE "COURIER_PACKAGE_STATUS" AS ENUM ('TO_BE_PICKED_UP', 'PICKED_UP', 'ADDED_TO_BAG', 'EN_ROUTE_TO_REGION', 'ARRIVED_AT_REGION', 'SCHEDULED_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELAYED');

-- CreateEnum
CREATE TYPE "JOURNEY_STATUS" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BAG_STATUS" AS ENUM ('OPEN', 'SEALED', 'LOADED', 'IN_TRANSIT', 'ARRIVED');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "locationLatitude" DOUBLE PRECISION NOT NULL,
    "locationLongitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrontOffice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "FrontOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalBusiness" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "ExternalBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourierPackage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "fromRegionId" TEXT NOT NULL,
    "toRegionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickedUpAt" TIMESTAMP(3),
    "fromAddressId" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "status" "COURIER_PACKAGE_STATUS" NOT NULL DEFAULT 'TO_BE_PICKED_UP',
    "sealedBagId" TEXT,

    CONSTRAINT "CourierPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "stopOrder" INTEGER NOT NULL,
    "routeId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "vehicleNumber" INTEGER NOT NULL,
    "isDelayed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "isLocal" BOOLEAN NOT NULL DEFAULT false,
    "status" "JOURNEY_STATUS" NOT NULL DEFAULT 'SCHEDULED',
    "vehicleId" TEXT,
    "routeId" TEXT,
    "scheduledDepartureAt" TIMESTAMP(3),
    "nextDepartureAt" TIMESTAMP(3),
    "actualDepartureAt" TIMESTAMP(3),
    "isDelayed" BOOLEAN NOT NULL DEFAULT false,
    "delayReason" TEXT,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SealedBag" (
    "id" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "fromRegionId" TEXT NOT NULL,
    "toRegionId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "status" "BAG_STATUS" NOT NULL DEFAULT 'OPEN',
    "timeArrivedAt" TIMESTAMP(3),
    "sealedAt" TIMESTAMP(3),
    "loadedAt" TIMESTAMP(3),

    CONSTRAINT "SealedBag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_regionCode_key" ON "Region"("regionCode");

-- CreateIndex
CREATE UNIQUE INDEX "FrontOffice_code_key" ON "FrontOffice"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalBusiness_code_key" ON "ExternalBusiness"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CourierPackage_code_key" ON "CourierPackage"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Route_code_key" ON "Route"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_stopOrder_key" ON "RouteStop"("routeId", "stopOrder");

-- CreateIndex
CREATE UNIQUE INDEX "RouteStop_routeId_regionId_key" ON "RouteStop"("routeId", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON "Vehicle"("vehicleNumber");

-- AddForeignKey
ALTER TABLE "FrontOffice" ADD CONSTRAINT "FrontOffice_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPackage" ADD CONSTRAINT "CourierPackage_fromRegionId_fkey" FOREIGN KEY ("fromRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPackage" ADD CONSTRAINT "CourierPackage_toRegionId_fkey" FOREIGN KEY ("toRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPackage" ADD CONSTRAINT "CourierPackage_fromAddressId_fkey" FOREIGN KEY ("fromAddressId") REFERENCES "ExternalBusiness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourierPackage" ADD CONSTRAINT "CourierPackage_sealedBagId_fkey" FOREIGN KEY ("sealedBagId") REFERENCES "SealedBag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SealedBag" ADD CONSTRAINT "SealedBag_fromRegionId_fkey" FOREIGN KEY ("fromRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SealedBag" ADD CONSTRAINT "SealedBag_toRegionId_fkey" FOREIGN KEY ("toRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SealedBag" ADD CONSTRAINT "SealedBag_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
