import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createChatSessionSchema,
  createChatMessageSchema,
} from "./chat.schema.js";

import {
  createSession,
  getSessions,
  getSession,
  createMessage,
  removeSession,
} from "./chat.controller.js";

const router = Router();

router.use(authenticate);

router.post(
  "/sessions",
  validate(createChatSessionSchema),
  createSession
);

router.get(
  "/sessions",
  getSessions
);

router.get(
  "/sessions/:sessionId",
  getSession
);

router.post(
  "/sessions/:sessionId/messages",
  validate(createChatMessageSchema),
  createMessage
);

router.delete(
  "/sessions/:sessionId",
  removeSession
);

export default router;