// general configuration that can be used with any projects
import { PrismaClient } from "@prisma/client"

// overwritten the default
declare global {
    var cachedPrisma: PrismaClient
}

let prisma: PrismaClient;

// checking the caching
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({
        errorFormat: "minimal",
        log: ["query", "info", "warn", "error"],
    });
} else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = new PrismaClient({
            errorFormat: "minimal",
            log: ["query", "info", "warn", "error"],
        });
    }
    prisma = global.cachedPrisma;
}

export const db = prisma

