import { PrismaClient } from "../../generated/prisma/client"

(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export const prismaClient = new PrismaClient()