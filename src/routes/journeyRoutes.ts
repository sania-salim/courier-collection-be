import { Router } from "express";
import {
  listJourneys,
  listActiveJourneys,
  listDelayedJourneys,
  getJourney,
  listJourneysByVehicle,
  listJourneysByRoute,
  createJourney,
  startJourney,
  delayJourney,
  rescheduleJourney,
  completeJourney,
  cancelJourney,
} from "../controllers/journeyController";
import { validate } from "../middleware/validate";
import {
  createJourneySchema,
  delayJourneySchema,
  idParamSchema,
  rescheduleJourneySchema,
} from "../schemas/apiSchemas";

const router = Router();

router.get("/", listJourneys);
router.get("/active", listActiveJourneys);
router.get("/delayed", listDelayedJourneys);
router.post("/", validate({ body: createJourneySchema }), createJourney);
router.get(
  "/vehicle/:vehicleId",
  validate({ params: idParamSchema.extend({ vehicleId: idParamSchema.shape.id }) }),
  listJourneysByVehicle,
);
router.get(
  "/route/:routeId",
  validate({ params: idParamSchema.extend({ routeId: idParamSchema.shape.id }) }),
  listJourneysByRoute,
);
router.get("/:id", validate({ params: idParamSchema }), getJourney);
router.post("/:id/start", validate({ params: idParamSchema }), startJourney);
router.post(
  "/:id/delay",
  validate({ params: idParamSchema, body: delayJourneySchema }),
  delayJourney,
);
router.post(
  "/:id/reschedule",
  validate({ params: idParamSchema, body: rescheduleJourneySchema }),
  rescheduleJourney,
);
router.post("/:id/complete", validate({ params: idParamSchema }), completeJourney);
router.post("/:id/cancel", validate({ params: idParamSchema }), cancelJourney);

export default router;
