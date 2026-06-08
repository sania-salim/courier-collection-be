import express from "express";
import packageRoutes from "./packageRoutes";

const router = express.Router();

router.use("/packages", packageRoutes);

export default router;
