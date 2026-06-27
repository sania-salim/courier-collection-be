import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma/client.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

export default prisma;
