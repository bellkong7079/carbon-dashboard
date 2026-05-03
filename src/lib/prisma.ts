import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Node.js 18/20에는 글로벌 WebSocket이 없으므로 ws 패키지를 사용
neonConfig.webSocketConstructor = ws

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
