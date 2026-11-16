import "dotenv/config";

import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.js";

const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("✅ PostgreSQL connected successfully!");

    app.listen(env.PORT, () => {
      console.log(`🚀 ShipSafe server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();