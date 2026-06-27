import { Router } from "express";
import {
  listExternalBusinesses,
  getExternalBusiness,
  getExternalBusinessByCode,
} from "../controllers/externalBusinessController";
import { validate } from "../middleware/validate";
import { codeParamSchema, idParamSchema } from "../schemas/apiSchemas";

const router = Router();

router.get("/", listExternalBusinesses);
router.get("/code/:code", validate({ params: codeParamSchema }), getExternalBusinessByCode);
router.get("/:id", validate({ params: idParamSchema }), getExternalBusiness);

export default router;
