import { PrismaClient } from "@prisma/client"

declare global {
    var prisma: PrismaClient | undefined
}

// use prisma if already defined during dev mode
const prisma = global.prisma || new PrismaClient()
export default prisma

if (process.env.NODE_ENV !== "production") global.prisma = prisma