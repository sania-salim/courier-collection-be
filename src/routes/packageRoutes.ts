import { Router } from "express";
import {
  listPackages,
  getPackage,
  createPackage,
  updatePackage,
} from "../controllers/packageController";
import { validate } from "../middleware/validate";
import {
  codeParamSchema,
  createPackageSchema,
  updatePackageSchema,
} from "../schemas/apiSchemas";

const router = Router();

router.get("/", listPackages);
router.post("/", validate({ body: createPackageSchema }), createPackage);
router.get("/:code", validate({ params: codeParamSchema }), getPackage);
router.patch(
  "/:code",
  validate({ params: codeParamSchema, body: updatePackageSchema }),
  updatePackage,
);

export default router;
