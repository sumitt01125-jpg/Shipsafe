import { Router } from "express";

import {
  register,
  login,
  logout,
  getMe,
  deleteAccount,
} from "./auth.controller.js";

import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
} from "./oauth.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
} from "./auth.schema.js";

import { oauthRateLimit } from "../../middlewares/oauthRateLimit.middleware.js";

const router = Router();

// NORMAL AUTH
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authenticate, getMe);

// DELETE ACCOUNT
router.delete("/account", authenticate, deleteAccount);

// GOOGLE OAUTH
router.get("/google", oauthRateLimit, googleLogin);
router.get("/google/callback", oauthRateLimit, googleCallback);

// GITHUB OAUTH
router.get("/github", oauthRateLimit, githubLogin);
router.get("/github/callback", oauthRateLimit, githubCallback);

export default router;