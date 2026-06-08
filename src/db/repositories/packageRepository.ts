import { pool } from "../index";
import { Package, PackageStatus } from "../types";

// Create
type CreatePackageInputType = {
    front_office_id: string;
    to_name: string;
    to_address: string;
    to_region_id: string;
    weight: number;
    current_region_id: string;
};

// lets us insert package into the table
export const createPackage = async (input: CreatePackageInputType): Promise<Package> => {
    const { rows } = await pool.query<Package>(
        `INSERT INTO packages (
        front_office_id, to_name, to_address,
        to_region_id, weight, current_region_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
        [
            input.front_office_id,
            input.to_name,
            input.to_address,
            input.to_region_id,
            input.weight,
            input.current_region_id,
        ]
    );
    return rows[0];
};

// --- READ ---

// find the package using tracking ID
export const findPackageByTrackingId = async (trackingId: string): Promise<Package | null> => {
    const { rows } = await pool.query<Package>(
        "SELECT * FROM packages WHERE tracking_id = $1", [trackingId]
    );

    return rows[0] ?? null; //rows returns array, if no package null
};


// find all packages
export const findAllPackages = async (): Promise<Package[]> => {
    const { rows } = await pool.query<Package>("SELECT * FROM packages ORDER BY created_at DESC");
    return rows;
};

// update package status
type UpdatePackageStatusInputType = {
    id: string;
    status: PackageStatus;
    current_region_id: string;
};

export const updatePackageStatus = async (input: UpdatePackageStatusInputType): Promise<Package> => {
    const { rows } = await pool.query<Package>(
        "UPDATE packages SET current_status = $1, current_region_id = $2 WHERE id = $3 RETURNING *",
        [input.status, input.current_region_id, input.id]
    );
    return rows[0];
};

// delete package
export const deletePackage = async (id: string): Promise<void> => {
    await pool.query("DELETE FROM packages WHERE id = $1", [id]);
};