const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_API_URL = "https://api.github.com";

const getConfig = () => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, API_URL } = process.env;

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !API_URL) {
    throw new Error("GitHub OAuth environment variables are missing");
  }

  return {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    redirectUri: `${API_URL}/api/auth/github/callback`,
  };
};

export const getGithubAuthorizationUrl = ({ state, codeChallenge }) => {
  const { clientId, redirectUri } = getConfig();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
};

export const verifyGithubCode = async ({ code, codeVerifier }) => {
  const config = getConfig();

  const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.access_token) {
    throw new Error("GitHub token exchange failed");
  }

  const headers = {
    Authorization: `Bearer ${tokenData.access_token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [userResponse, emailResponse] = await Promise.all([
    fetch(`${GITHUB_API_URL}/user`, { headers }),
    fetch(`${GITHUB_API_URL}/user/emails`, { headers }),
  ]);

  if (!userResponse.ok || !emailResponse.ok) {
    throw new Error("GitHub profile verification failed");
  }

  const [githubUser, emails] = await Promise.all([
    userResponse.json(),
    emailResponse.json(),
  ]);

  const primaryEmail = emails.find(
    (email) => email.primary && email.verified
  );

  if (!githubUser.id || !primaryEmail) {
    throw new Error("No verified primary GitHub email found");
  }

  return {
    providerAccountId: String(githubUser.id),
    email: primaryEmail.email.toLowerCase(),
    name: githubUser.name || githubUser.login,
  };
};