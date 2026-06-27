import { Router } from "express";
import {
  listRegions,
  getRegion,
  getRegionByCode,
  getRegionWithFrontOffices,
} from "../controllers/regionController";
import { validate } from "../middleware/validate";
import { codeParamSchema, idParamSchema } from "../schemas/apiSchemas";

const router = Router();

router.get("/", listRegions);
router.get("/code/:code", validate({ params: codeParamSchema }), getRegionByCode);
router.get("/:id", validate({ params: idParamSchema }), getRegion);
router.get(
  "/:id/front-offices",
  validate({ params: idParamSchema }),
  getRegionWithFrontOffices,
);

export default router;
