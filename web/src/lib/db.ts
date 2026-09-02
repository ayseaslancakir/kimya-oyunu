import { PrismaClient } from "@prisma/client";

// Next.js geliştirme modunda Prisma istemcisinin tekrar tekrar
// oluşturulmasını önleyen singleton deseni.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
