// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow re-use of PrismaClient during hot-reload in dev
  // (avoids exhausting your database with new connections)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({ log: ['query'] })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export default prisma
