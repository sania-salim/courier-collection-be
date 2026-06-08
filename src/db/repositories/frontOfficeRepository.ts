import { pool } from "../index";
import { FrontOffice } from "../types";

export const findAllFrontOffices = async (): Promise<FrontOffice[]> => {
  const { rows } = await pool.query<FrontOffice>(
    "SELECT * FROM front_offices ORDER BY name"
  );
  return rows;
};

export const findFrontOfficeById = async (id: string): Promise<FrontOffice | null> => {
  const { rows } = await pool.query<FrontOffice>(
    "SELECT * FROM front_offices WHERE id = $1",
    [id]
  );
  return rows[0] ?? null;
};