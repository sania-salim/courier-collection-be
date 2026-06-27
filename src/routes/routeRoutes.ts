import { Router } from "express";
import {
  listRoutes,
  getRoute,
  getRouteByCode,
  getRouteWithStops,
  listRegionsOnRoute,
  listRoutesThroughRegion,
  createRoute,
  updateRoute,
  addRouteStop,
} from "../controllers/routeController";
import { validate } from "../middleware/validate";
import {
  addRouteStopSchema,
  codeParamSchema,
  createRouteSchema,
  idParamSchema,
  updateRouteSchema,
} from "../schemas/apiSchemas";

const router = Router();

router.get("/", listRoutes);
router.post("/", validate({ body: createRouteSchema }), createRoute);
router.get("/code/:code", validate({ params: codeParamSchema }), getRouteByCode);
router.patch(
  "/code/:code",
  validate({ params: codeParamSchema, body: updateRouteSchema }),
  updateRoute,
);
router.post("/stops", validate({ body: addRouteStopSchema }), addRouteStop);
router.get(
  "/region/:regionId",
  validate({ params: idParamSchema.extend({ regionId: idParamSchema.shape.id }) }),
  listRoutesThroughRegion,
);
router.get("/:id", validate({ params: idParamSchema }), getRoute);
router.get(
  "/:id/stops",
  validate({ params: idParamSchema }),
  getRouteWithStops,
);
router.get(
  "/:id/regions",
  validate({ params: idParamSchema }),
  listRegionsOnRoute,
);

export default router;
