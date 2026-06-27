import { Router } from "express";
import {
  listVehicles,
  listAvailableVehicles,
  listDelayedVehicles,
  listUnassignedVehicles,
  getVehicle,
  getVehicleByNumber,
  getVehicleWithBags,
  getVehicleByPackageCode,
  createVehicle,
  updateVehicle,
  markVehicleDelayed,
  clearVehicleDelay,
  assignBagToVehicle,
} from "../controllers/vehicleController";
import { validate } from "../middleware/validate";
import {
  assignBagSchema,
  createVehicleSchema,
  idParamSchema,
  updateVehicleSchema,
  vehicleNumberParamSchema,
} from "../schemas/apiSchemas";
import { codeParamSchema } from "../schemas/apiSchemas";

const router = Router();

router.get("/", listVehicles);
router.get("/available", listAvailableVehicles);
router.get("/delayed", listDelayedVehicles);
router.get("/unassigned", listUnassignedVehicles);
router.get(
  "/by-package/:packageCode",
  validate({ params: codeParamSchema.extend({ packageCode: codeParamSchema.shape.code }) }),
  getVehicleByPackageCode,
);
router.get(
  "/number/:vehicleNumber",
  validate({ params: vehicleNumberParamSchema }),
  getVehicleByNumber,
);
router.post("/", validate({ body: createVehicleSchema }), createVehicle);
router.get("/:id", validate({ params: idParamSchema }), getVehicle);
router.get(
  "/:id/bags",
  validate({ params: idParamSchema }),
  getVehicleWithBags,
);
router.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateVehicleSchema }),
  updateVehicle,
);
router.post(
  "/:id/delay",
  validate({ params: idParamSchema }),
  markVehicleDelayed,
);
router.post(
  "/:id/clear-delay",
  validate({ params: idParamSchema }),
  clearVehicleDelay,
);
router.post(
  "/:id/assign-bag",
  validate({ params: idParamSchema, body: assignBagSchema }),
  assignBagToVehicle,
);

export default router;
