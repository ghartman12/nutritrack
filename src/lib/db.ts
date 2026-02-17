import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function getUserId(request: NextRequest): string | null {
  return request.headers.get("x-user-id");
}
