// services/packageService.ts
import * as packageRepo from "../db/repositories/packageRepository";
import * as saleRepo from "../db/repositories/saleRepository";
import { PackageStatus } from "../db/types";
import { NotFoundError } from "../errors/NotFoundError";
import { CreatePackageInput } from "../schemas/packageSchemas";

export const createPackage = async (input: CreatePackageInput) => {
  // 1. Create the package
  const package_ = await packageRepo.createPackage({
    front_office_id:   input.front_office_id,
    to_name:           input.to_name,
    to_address:        input.to_address,
    to_region_id:      input.to_region_id,
    weight:            input.weight,
    current_region_id: input.current_region_id,
  });

  // 2. Create the sale
  const sale = await saleRepo.createSale({
    package_id:     package_.id,
    amount:         input.amount,
    payment_method: input.payment_method,
    receipt_number: input.receipt_number,
  });

  return { package: package_, sale };
};

// --- LIST ---
export const getAllPackages = async () => {
  return packageRepo.findAllPackages();
};

// --- UPDATE STATUS ---
export const updatePackageStatus = async (
  id: string,
  status: PackageStatus
) => {
  const existing = await packageRepo.findPackageById(id);
  if (!existing) throw new NotFoundError("Package not found");

  const updated = await packageRepo.updatePackageStatus({
    id: existing.id,
    status,
    current_region_id: existing.current_region_id,
  });

  return updated;
};

// --- TRACKING ---
export const getTrackingDetails = async (trackingId: string) => {
  const package_ = await packageRepo.findPackageByTrackingId(trackingId);
  if (!package_) throw new NotFoundError("Tracking ID not found");

  return {
    tracking_id:     package_.tracking_id,
    current_status:  package_.current_status,
    current_region:  package_.current_region_id,
    to_name:         package_.to_name,
    to_address:      package_.to_address,
  };
};
