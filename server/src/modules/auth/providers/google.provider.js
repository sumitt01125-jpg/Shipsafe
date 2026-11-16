import { OAuth2Client } from "google-auth-library";

const getGoogleClient = () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are missing");
  }

  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${process.env.API_URL}/api/auth/google/callback`
  );
};

export const getGoogleAuthorizationUrl = ({
  state,
  codeChallenge,
}) => {
  const client = getGoogleClient();

  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
};

export const verifyGoogleCode = async ({
  code,
  codeVerifier,
}) => {
  const client = getGoogleClient();

  const { tokens } = await client.getToken({
    code,
    codeVerifier,
  });

  if (!tokens.id_token) {
    throw new Error("Google ID token missing");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (
    !payload ||
    !payload.sub ||
    !payload.email ||
    payload.email_verified !== true
  ) {
    throw new Error("Invalid Google account");
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split("@")[0],
  };
};