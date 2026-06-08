import { pool } from "../index";
import { Sale } from "../types";

type CreateSaleInput = {
  package_id:     string;
  amount:         number;
  payment_method: string;
  receipt_number: string;
};

export const createSale = async (input: CreateSaleInput): Promise<Sale> => {
  const { rows } = await pool.query<Sale>(
    `INSERT INTO sales (package_id, amount, payment_method, receipt_number)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.package_id, input.amount, input.payment_method, input.receipt_number]
  );
  return rows[0];
};

export const findSaleByPackageId = async (packageId: string): Promise<Sale | null> => {
  const { rows } = await pool.query<Sale>(
    "SELECT * FROM sales WHERE package_id = $1",
    [packageId]
  );
  return rows[0] ?? null;
};