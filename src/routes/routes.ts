import express from "express";
import { API } from "../constants/url";
import regionRoutes from "./regionRoutes";
import frontOfficeRoutes from "./frontOfficeRoutes";
import vehicleRoutes from "./vehicleRoutes";
import routeRoutes from "./routeRoutes";
import packageRoutes from "./packageRoutes";
import externalBusinessRoutes from "./externalBusinessRoutes";
import sealedBagRoutes from "./sealedBagRoutes";
import journeyRoutes from "./journeyRoutes";
import simulationRoutes from "./simulationRoutes";

const router = express.Router();

router.use(API.regions, regionRoutes);
router.use(API.frontOffices, frontOfficeRoutes);
router.use(API.vehicles, vehicleRoutes);
router.use(API.routes, routeRoutes);
router.use(API.packages, packageRoutes);
router.use(API.externalBusinesses, externalBusinessRoutes);
router.use(API.sealedBags, sealedBagRoutes);
router.use(API.journeys, journeyRoutes);
router.use(API.simulation, simulationRoutes);

export default router;
