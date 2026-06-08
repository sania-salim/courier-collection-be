import { Router } from "express";
import {
  createPackage,
  getAllPackages,
  updatePackageStatus,
  getTrackingDetails,
} from "../controllers/packageController";
import { validate } from "../middleware/validate";
import {
  createPackageSchema,
  packageIdParamSchema,
  trackingIdParamSchema,
  updatePackageStatusSchema,
} from "../schemas/packageSchemas";

const router = Router();

router.post("/", validate({ body: createPackageSchema }), createPackage);
router.get("/", getAllPackages);
router.patch(
  "/:id/status",
  validate({ params: packageIdParamSchema, body: updatePackageStatusSchema }),
  updatePackageStatus
);
router.get(
  "/tracking/:trackingId",
  validate({ params: trackingIdParamSchema }),
  getTrackingDetails
);

export default router;
