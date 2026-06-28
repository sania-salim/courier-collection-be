import { Router } from "express";
import {
  getStatus,
  runSimulationTick,
} from "../controllers/simulationController";

const router = Router();

router.get("/status", getStatus);
router.post("/tick", runSimulationTick);

export default router;
