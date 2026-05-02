import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { activityInputSchema } from '@/lib/validations'
import { calculateEmission, resolveScope, ACTIVITY_TYPE_UNITS, DESCRIPTION_TO_FACTOR_KEY } from '@/lib/emissions'
import { Prisma } from '@prisma/client'

/**
 * @swagger
 * /api/activities:
 *   get:
 *     tags: [activities]
 *     summary: 활동 데이터 목록 조회
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [electricity, material, transport]
 *         description: 활동 유형 필터
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: 시작 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: 종료 날짜 (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, emission]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: 활동 데이터 목록 반환
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)
    const sortBy = searchParams.get('sortBy') ?? 'date'
    const order = (searchParams.get('order') ?? 'desc') as 'asc' | 'desc'

    const where: Prisma.ActivityWhereInput = {}
    if (type) where.activityType = type
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ])

    return NextResponse.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('[GET /api/activities]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

/**
 * @swagger
 * /api/activities:
 *   post:
 *     tags: [activities]
 *     summary: 활동 데이터 등록
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, activityType, description, amount]
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2025-09-01"
 *               activityType:
 *                 type: string
 *                 enum: [electricity, material, transport]
 *               description:
 *                 type: string
 *                 example: "한국전력"
 *               amount:
 *                 type: number
 *                 example: 95
 *     responses:
 *       201:
 *         description: 생성된 Activity 객체
 *       400:
 *         description: 유효하지 않은 입력
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = activityInputSchema.safeParse({
      ...body,
      amount: typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount,
    })

    if (!parsed.success) {
      const details: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString() ?? 'unknown'
        details[field] = issue.message
      }
      return NextResponse.json(
        { error: '유효하지 않은 입력', details },
        { status: 400 }
      )
    }

    const { date, activityType, description, amount } = parsed.data

    const factorKey = DESCRIPTION_TO_FACTOR_KEY[description]
    if (!factorKey) {
      return NextResponse.json(
        { error: '알 수 없는 설명입니다. 올바른 설명을 선택하세요.' },
        { status: 400 }
      )
    }

    const efVersion = await prisma.emissionFactorVersion.findFirst({
      where: {
        emissionFactor: { key: factorKey },
        validTo: null,
      },
      orderBy: { validFrom: 'desc' },
    })

    if (!efVersion) {
      return NextResponse.json(
        { error: '배출계수를 찾을 수 없습니다' },
        { status: 400 }
      )
    }

    const scope = resolveScope(activityType)
    const unit = ACTIVITY_TYPE_UNITS[activityType]
    const emission = calculateEmission(amount, efVersion.factor)

    const activity = await prisma.activity.create({
      data: {
        date: new Date(date),
        activityType,
        description,
        amount,
        unit,
        emissionFactor: efVersion.factor,
        emission,
        scope,
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('[POST /api/activities]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
