-- Package physical location at a hub
ALTER TABLE "CourierPackage" ADD COLUMN "currentRegionId" TEXT;

UPDATE "CourierPackage" SET "currentRegionId" = "fromRegionId";

ALTER TABLE "CourierPackage" ALTER COLUMN "currentRegionId" SET NOT NULL;

ALTER TABLE "CourierPackage"
ADD CONSTRAINT "CourierPackage_currentRegionId_fkey"
FOREIGN KEY ("currentRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bag weight limit (default 5 kg)
ALTER TABLE "SealedBag" ADD COLUMN "maxWeightKg" INTEGER NOT NULL DEFAULT 5;

-- Route-based bags may hold packages with different final destinations
ALTER TABLE "SealedBag" ALTER COLUMN "toRegionId" DROP NOT NULL;

-- Journey position for route simulation
ALTER TABLE "Journey" ADD COLUMN "currentRegionId" TEXT;
ALTER TABLE "Journey" ADD COLUMN "nextArrivalAt" TIMESTAMP(3);

ALTER TABLE "Journey"
ADD CONSTRAINT "Journey_currentRegionId_fkey"
FOREIGN KEY ("currentRegionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
