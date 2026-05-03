export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/emission-factors:
 *   get:
 *     tags: [emission-factors]
 *     summary: 현재 유효한 배출계수 목록 조회
 *     responses:
 *       200:
 *         description: 배출계수 목록 반환
 */
export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({
      include: {
        versions: {
          where: { validTo: null },
          orderBy: { validFrom: 'desc' },
          take: 1,
        },
      },
      orderBy: { key: 'asc' },
    })

    const data = factors.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      unit: f.unit,
      createdAt: f.createdAt,
      currentFactor: f.versions[0]?.factor ?? null,
      source: f.versions[0]?.source ?? null,
      validFrom: f.versions[0]?.validFrom ?? null,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/emission-factors]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다', debug: String(error) }, { status: 500 })
  }
}
