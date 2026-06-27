import { Router } from "express";
import {
  listFrontOffices,
  getFrontOffice,
  getFrontOfficeByCode,
  listFrontOfficesByRegion,
} from "../controllers/frontOfficeController";
import { validate } from "../middleware/validate";
import { codeParamSchema, idParamSchema } from "../schemas/apiSchemas";

const router = Router();

router.get("/", listFrontOffices);
router.get("/code/:code", validate({ params: codeParamSchema }), getFrontOfficeByCode);
router.get(
  "/region/:regionId",
  validate({ params: idParamSchema.extend({ regionId: idParamSchema.shape.id }) }),
  listFrontOfficesByRegion,
);
router.get("/:id", validate({ params: idParamSchema }), getFrontOffice);

export default router;
