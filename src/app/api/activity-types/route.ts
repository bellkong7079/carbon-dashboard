export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/activity-types:
 *   get:
 *     tags: [activity-types]
 *     summary: 활동 유형 목록 조회
 *     responses:
 *       200:
 *         description: 활동 유형 목록 반환
 */
export async function GET() {
  try {
    const types = await prisma.activityType.findMany({ orderBy: { createdAt: 'asc' } })
    return NextResponse.json(types)
  } catch (error) {
    console.error('[GET /api/activity-types]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/activity-types:
 *   post:
 *     tags: [activity-types]
 *     summary: 활동 유형 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, unit, scope]
 *             properties:
 *               label:
 *                 type: string
 *                 example: "열에너지"
 *               unit:
 *                 type: string
 *                 example: "GJ"
 *               scope:
 *                 type: string
 *                 enum: [scope2, scope3]
 *     responses:
 *       201:
 *         description: 생성된 ActivityType
 *       400:
 *         description: 유효하지 않은 입력
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { label, unit, scope } = body

    if (!label || !unit || !scope) {
      return NextResponse.json({ error: '필수 값이 누락되었습니다 (label, unit, scope)' }, { status: 400 })
    }
    if (scope !== 'scope2' && scope !== 'scope3') {
      return NextResponse.json({ error: 'scope는 scope2 또는 scope3 이어야 합니다' }, { status: 400 })
    }

    const key = `${label.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`

    const existing = await prisma.activityType.findFirst({ where: { label } })
    if (existing) {
      return NextResponse.json({ error: '동일한 이름의 활동 유형이 이미 존재합니다' }, { status: 409 })
    }

    const activityType = await prisma.activityType.create({ data: { key, label, unit, scope } })
    return NextResponse.json(activityType, { status: 201 })
  } catch (error) {
    console.error('[POST /api/activity-types]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
