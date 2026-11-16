import { PrismaClient } from "../../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

// PostgreSQL connection adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_POOLED,
});

// Prisma client instance
const prisma = new PrismaClient({
  adapter,
});

export default prisma;