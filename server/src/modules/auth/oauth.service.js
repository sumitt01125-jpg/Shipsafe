import crypto from "node:crypto";
import prisma from "../../config/db.js";
import { AuthProvider } from "../../../generated/prisma/client.ts";

import {
  getGoogleAuthorizationUrl,
  verifyGoogleCode,
} from "./providers/google.provider.js";

import {
  getGithubAuthorizationUrl,
  verifyGithubCode,
} from "./providers/github.provider.js";

const STATE_EXPIRY = 5 * 60 * 1000;

// ENCRYPTION KEY
const getEncryptionKey = () => {
  const key = process.env.OAUTH_STATE_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("OAuth encryption key missing");
  }

  const decoded = Buffer.from(key, "base64");

  if (decoded.length !== 32) {
    throw new Error("OAuth encryption key must be 32 bytes");
  }

  return decoded;
};

// ENCRYPT PKCE VERIFIER
const encryptVerifier = (value) => {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
};

// DECRYPT PKCE VERIFIER
const decryptVerifier = (value) => {
  const [iv, authTag, encrypted] = value.split(".");

  if (!iv || !authTag || !encrypted) {
    throw new Error("Invalid encrypted OAuth verifier");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(iv, "base64url")
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

// GENERATE PKCE
const generatePKCE = () => {
  const verifier = crypto.randomBytes(32).toString("base64url");

  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");

  return { verifier, challenge };
};

// GENERATE STATE
const generateState = () => {
  return crypto.randomBytes(32).toString("base64url");
};

// START OAUTH
const startOAuth = async (provider, getAuthorizationUrl) => {
  const state = generateState();
  const { verifier, challenge } = generatePKCE();

  // Remove expired OAuth states
  await prisma.oAuthState.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  // Store encrypted verifier
  await prisma.oAuthState.create({
    data: {
      state,
      codeVerifier: encryptVerifier(verifier),
      provider,
      expiresAt: new Date(Date.now() + STATE_EXPIRY),
    },
  });

  const authorizationUrl = getAuthorizationUrl({
    state,
    codeChallenge: challenge,
  });

  return {
    authorizationUrl,
    state,
  };
};

// START GOOGLE
export const startGoogleOAuth = async () => {
  return startOAuth(
    AuthProvider.GOOGLE,
    getGoogleAuthorizationUrl
  );
};

// START GITHUB
export const startGithubOAuth = async () => {
  return startOAuth(
    AuthProvider.GITHUB,
    getGithubAuthorizationUrl
  );
};

// CONSUME OAUTH STATE
const consumeOAuthState = async (state, provider) => {
  return prisma.$transaction(
    async (tx) => {
      const record = await tx.oAuthState.findUnique({
        where: { state },
      });

      if (
        !record ||
        record.provider !== provider ||
        record.expiresAt <= new Date()
      ) {
        throw new Error("Invalid or expired OAuth state");
      }

      const result = await tx.oAuthState.deleteMany({
        where: {
          id: record.id,
          state,
          provider,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (result.count !== 1) {
        throw new Error("OAuth state already consumed");
      }

      return decryptVerifier(record.codeVerifier);
    },
    {
      isolationLevel: "Serializable",
    }
  );
};

// COMPLETE OAUTH
const completeOAuth = async ({
  code,
  state,
  provider,
  verifyCode,
}) => {
  if (!code || !state) {
    throw new Error("Invalid OAuth callback");
  }

  const codeVerifier = await consumeOAuthState(state, provider);

  const identity = await verifyCode({
    code,
    codeVerifier,
  });

  if (
    !identity.providerAccountId ||
    !identity.email ||
    !identity.name
  ) {
    throw new Error("Invalid OAuth account information");
  }

  // Check existing provider account
  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerAccountId: {
        provider,
        providerAccountId: identity.providerAccountId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  // Prevent automatic account linking
  const existingUser = await prisma.user.findUnique({
    where: {
      email: identity.email,
    },
  });

  if (existingUser) {
    const error = new Error(
      "An account with this email already exists. Sign in using your existing method first."
    );

    error.statusCode = 409;
    throw error;
  }

  // Create user and OAuth account atomically
  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: identity.name,
          email: identity.email,
          passwordHash: null,
        },
      });

      await tx.oAuthAccount.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId: identity.providerAccountId,
        },
      });

      return user;
    });
  } catch (error) {
    if (error.code === "P2002") {
      const conflict = new Error(
        "This email or OAuth account is already registered."
      );

      conflict.statusCode = 409;
      throw conflict;
    }

    throw error;
  }
};

// COMPLETE GOOGLE OAUTH
export const completeGoogleOAuth = async ({ code, state }) => {
  return completeOAuth({
    code,
    state,
    provider: AuthProvider.GOOGLE,
    verifyCode: verifyGoogleCode,
  });
};

// COMPLETE GITHUB OAUTH
export const completeGithubOAuth = async ({ code, state }) => {
  return completeOAuth({
    code,
    state,
    provider: AuthProvider.GITHUB,
    verifyCode: verifyGithubCode,
  });
};