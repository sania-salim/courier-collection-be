import { pool } from "../index";
import { Region } from "../types";

export const findAllRegions = async (): Promise<Region[]> => {
  const { rows } = await pool.query<Region>(
    "SELECT * FROM regions ORDER BY region_code"
  );
  return rows;
};
