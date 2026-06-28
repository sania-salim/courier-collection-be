import { Router } from "express";
import {
  listExternalBusinesses,
  getExternalBusiness,
  getExternalBusinessByCode,
  createExternalBusiness,
} from "../controllers/externalBusinessController";
import { validate } from "../middleware/validate";
import { codeParamSchema, createExternalBusinessSchema, idParamSchema } from "../schemas/apiSchemas";

const router = Router();

router.get("/", listExternalBusinesses);
router.post("/", validate({ body: createExternalBusinessSchema }), createExternalBusiness);
router.get("/code/:code", validate({ params: codeParamSchema }), getExternalBusinessByCode);
router.get("/:id", validate({ params: idParamSchema }), getExternalBusiness);

export default router;
