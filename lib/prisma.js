import { PrismaClient } from "@prisma/client";

// ✅ Wrapped in factory so connection options are applied correctly
const prismaClientSingleton = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

export const db = globalThis.prisma ?? prismaClientSingleton();

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}