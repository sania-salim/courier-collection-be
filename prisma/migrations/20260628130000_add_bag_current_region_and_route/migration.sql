-- Rename origin hub field for clarity
ALTER TABLE "SealedBag" RENAME COLUMN "fromRegionId" TO "originRegionId";

ALTER TABLE "SealedBag"
RENAME CONSTRAINT "SealedBag_fromRegionId_fkey" TO "SealedBag_originRegionId_fkey";

-- Track where the bag physically is now
ALTER TABLE "SealedBag" ADD COLUMN "currentRegionId" TEXT;

UPDATE "SealedBag" SET "currentRegionId" = "originRegionId";

ALTER TABLE "SealedBag" ALTER COLUMN "currentRegionId" SET NOT NULL;

ALTER TABLE "SealedBag"
ADD CONSTRAINT "SealedBag_currentRegionId_fkey"
FOREIGN KEY ("currentRegionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Route the bag is travelling on from the current region
ALTER TABLE "SealedBag" ADD COLUMN "routeId" TEXT;

ALTER TABLE "SealedBag"
ADD CONSTRAINT "SealedBag_routeId_fkey"
FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
