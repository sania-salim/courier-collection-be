import { Router } from "express";
import {
  listSealedBags,
  listBagsByStatus,
  listBagsForRegion,
  getSealedBag,
  getBagSummary,
  listPackagesInBag,
  createSealedBag,
  addPackageToBag,
  removePackageFromBag,
  sealBag,
  assignBagToVehicle,
} from "../controllers/sealedBagController";
import { validate } from "../middleware/validate";
import {
  assignBagToVehicleSchema,
  bagPackageSchema,
  bagStatusQuerySchema,
  createSealedBagSchema,
  idParamSchema,
  regionBagsQuerySchema,
} from "../schemas/apiSchemas";

const router = Router();

router.get("/", listSealedBags);
router.get(
  "/by-status",
  validate({ query: bagStatusQuerySchema }),
  listBagsByStatus,
);
router.post("/", validate({ body: createSealedBagSchema }), createSealedBag);
router.get(
  "/region/:regionId",
  validate({
    params: idParamSchema.extend({ regionId: idParamSchema.shape.id }),
    query: regionBagsQuerySchema,
  }),
  listBagsForRegion,
);
router.get("/:id", validate({ params: idParamSchema }), getSealedBag);
router.get(
  "/:id/summary",
  validate({ params: idParamSchema }),
  getBagSummary,
);
router.get(
  "/:id/packages",
  validate({ params: idParamSchema }),
  listPackagesInBag,
);
router.post(
  "/:id/packages",
  validate({ params: idParamSchema, body: bagPackageSchema }),
  addPackageToBag,
);
router.delete(
  "/:id/packages",
  validate({ params: idParamSchema, body: bagPackageSchema }),
  removePackageFromBag,
);
router.post("/:id/seal", validate({ params: idParamSchema }), sealBag);
router.post(
  "/:id/assign-vehicle",
  validate({ params: idParamSchema, body: assignBagToVehicleSchema }),
  assignBagToVehicle,
);

export default router;
