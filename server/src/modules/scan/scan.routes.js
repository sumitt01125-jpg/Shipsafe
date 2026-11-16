import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createScanSchema,
  updateFindingSchema,
} from "./scan.schema.js";

import {
  analyzeRepository,
  getScans,
  getScan,
  getFindings,
  updateFinding,
} from "./scan.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate(createScanSchema),
  analyzeRepository
);

router.get(
  "/",
  getScans
);

// Complete report
router.get(
  "/:scanId",
  getScan
);

router.get(
  "/:scanId/findings",
  getFindings
);

router.patch(
  "/:scanId/findings/:findingId",
  validate(updateFindingSchema),
  updateFinding
);

export default router;