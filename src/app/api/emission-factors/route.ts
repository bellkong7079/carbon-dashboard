export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
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
      orderBy: { activityType: 'asc' },
    })

    const data = factors.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      unit: f.unit,
      activityType: f.activityType,
      createdAt: f.createdAt,
      currentFactor: f.versions[0]?.factor ?? null,
      source: f.versions[0]?.source ?? null,
      validFrom: f.versions[0]?.validFrom ?? null,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/emission-factors]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/emission-factors:
 *   post:
 *     tags: [emission-factors]
 *     summary: 배출계수 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activityType, name, unit, factor, source]
 *             properties:
 *               activityType:
 *                 type: string
 *               name:
 *                 type: string
 *               unit:
 *                 type: string
 *               factor:
 *                 type: number
 *               source:
 *                 type: string
 *     responses:
 *       201:
 *         description: 생성된 배출계수
 *       400:
 *         description: 유효하지 않은 입력
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { activityType, name, unit, factor, source } = body

    if (!activityType || !name || !unit || factor == null || !source) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다' }, { status: 400 })
    }
    if (typeof factor !== 'number' || factor <= 0) {
      return NextResponse.json({ error: '배출계수는 0보다 큰 숫자여야 합니다' }, { status: 400 })
    }

    const existing = await prisma.emissionFactor.findFirst({ where: { name, activityType } })
    if (existing) {
      return NextResponse.json({ error: '동일한 활동 유형에 같은 이름의 배출계수가 이미 존재합니다' }, { status: 409 })
    }

    const key = `${activityType}_${name.replace(/\s+/g, '_')}_${Date.now()}`

    const ef = await prisma.emissionFactor.create({
      data: { key, name, unit, activityType },
    })
    await prisma.emissionFactorVersion.create({
      data: {
        emissionFactorId: ef.id,
        factor,
        source,
        validFrom: new Date(),
        validTo: null,
      },
    })

    const created = {
      id: ef.id,
      key: ef.key,
      name: ef.name,
      unit: ef.unit,
      activityType: ef.activityType,
      createdAt: ef.createdAt,
      currentFactor: factor,
      source,
    }
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error('[POST /api/emission-factors]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
