-- CreateTable
CREATE TABLE "PackageScanLog" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "status" "COURIER_PACKAGE_STATUS" NOT NULL,
    "notes" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PackageScanLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageScanLog_packageId_scannedAt_idx" ON "PackageScanLog"("packageId", "scannedAt");

-- AddForeignKey
ALTER TABLE "PackageScanLog" ADD CONSTRAINT "PackageScanLog_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "CourierPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageScanLog" ADD CONSTRAINT "PackageScanLog_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
