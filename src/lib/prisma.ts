// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // allow re-use of PrismaClient in dev
  // (avoids hot-reload exhaustion of connections)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ['query'], // you can remove this if you don’t want SQL logs
  })

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}
// src/lib/prisma.ts
export default prisma
