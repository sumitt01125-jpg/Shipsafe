import crypto from "node:crypto";

import {
  startGoogleOAuth,
  completeGoogleOAuth,
  startGithubOAuth,
  completeGithubOAuth,
} from "./oauth.service.js";

import { generateToken } from "./auth.service.js";
import { authCookieOptions } from "../../config/cookie.js";

const STATE_COOKIE = "oauth_state";
const STATE_COOKIE_MAX_AGE = 5 * 60 * 1000;

const stateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth",
  maxAge: STATE_COOKIE_MAX_AGE,
};

const clearStateCookie = (res) => {
  res.clearCookie(STATE_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });
};

const redirectToFrontend = (res, status) => {
  return res.redirect(
    `${process.env.CLIENT_URL}/login?oauth=${status}`
  );
};

const startOAuth = async (res, startFunction) => {
  const { authorizationUrl, state } = await startFunction();

  res.cookie(STATE_COOKIE, state, stateCookieOptions);

  return res.redirect(authorizationUrl);
};

const completeOAuthCallback = async (
  req,
  res,
  completeFunction
) => {
  const { code, state, error } = req.query;
  const browserState = req.cookies?.[STATE_COOKIE];

  clearStateCookie(res);

  if (error || !code || !state || !browserState) {
    return redirectToFrontend(res, "failed");
  }

  const receivedState = String(state);
  const cookieState = String(browserState);

  const statesMatch =
    receivedState.length === cookieState.length &&
    crypto.timingSafeEqual(
      Buffer.from(receivedState),
      Buffer.from(cookieState)
    );

  if (!statesMatch) {
    return redirectToFrontend(res, "failed");
  }

  const user = await completeFunction({
    code: String(code),
    state: receivedState,
  });

  const token = generateToken(user.id);

  res.cookie("token", token, authCookieOptions);

  return res.redirect(`${process.env.CLIENT_URL}/workspace`);
};

// GOOGLE
export const googleLogin = async (req, res, next) => {
  try {
    return await startOAuth(res, startGoogleOAuth);
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res) => {
  try {
    return await completeOAuthCallback(
      req,
      res,
      completeGoogleOAuth
    );
  } catch (error) {
    console.error("Google OAuth failed:", error.message);
    return redirectToFrontend(res, "failed");
  }
};

// GITHUB
export const githubLogin = async (req, res, next) => {
  try {
    return await startOAuth(res, startGithubOAuth);
  } catch (error) {
    next(error);
  }
};

export const githubCallback = async (req, res) => {
  try {
    return await completeOAuthCallback(
      req,
      res,
      completeGithubOAuth
    );
  } catch (error) {
    console.error("GitHub OAuth failed:", error.message);
    return redirectToFrontend(res, "failed");
  }
};