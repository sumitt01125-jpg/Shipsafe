import { Router } from "express";

import {
  createRepository,
  getRepositories,
  removeRepository,
} from "./repository.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { createRepositorySchema } from "./repository.schema.js";

const router = Router();

// All repository routes require authentication
router.use(authenticate);

// Add repository
router.post(
  "/",
  validate(createRepositorySchema),
  createRepository
);

// Get user's repositories
router.get("/", getRepositories);

// Delete repository
router.delete("/:repositoryId", removeRepository);

export default router;