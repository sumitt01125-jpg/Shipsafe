import "dotenv/config";

const env = {
  PORT: process.env.PORT || 5000,

  CLIENT_URL:
    process.env.CLIENT_URL || "http://localhost:5173",

  API_URL:
    process.env.API_URL || "http://localhost:5000",

  NODE_ENV:
    process.env.NODE_ENV || "development",
};

export default env;