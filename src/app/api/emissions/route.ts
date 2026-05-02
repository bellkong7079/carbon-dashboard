export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateInsight } from '@/lib/emissions'

/**
 * @swagger
 * /api/emissions:
 *   get:
 *     tags: [emissions]
 *     summary: 배출량 집계 및 분석 데이터 조회
 *     responses:
 *       200:
 *         description: 배출량 집계 데이터 반환
 */
export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { date: 'asc' },
    })

    const total = activities.reduce((sum, a) => sum + a.emission, 0)
    const totalCount = activities.length

    // byCategory
    const categoryMap: Record<string, { emission: number; count: number }> = {}
    for (const a of activities) {
      if (!categoryMap[a.activityType]) categoryMap[a.activityType] = { emission: 0, count: 0 }
      categoryMap[a.activityType].emission += a.emission
      categoryMap[a.activityType].count++
    }
    const byCategory: Record<string, { emission: number; count: number; percent: number }> = {}
    for (const [key, val] of Object.entries(categoryMap)) {
      byCategory[key] = {
        emission: Math.round(val.emission * 100) / 100,
        count: val.count,
        percent: total > 0 ? Math.round((val.emission / total) * 1000) / 10 : 0,
      }
    }

    // byScope
    const scopeMap: Record<string, number> = {}
    for (const a of activities) {
      scopeMap[a.scope] = (scopeMap[a.scope] ?? 0) + a.emission
    }
    const byScope: Record<string, { emission: number; percent: number }> = {}
    for (const [key, val] of Object.entries(scopeMap)) {
      byScope[key] = {
        emission: Math.round(val * 100) / 100,
        percent: total > 0 ? Math.round((val / total) * 1000) / 10 : 0,
      }
    }

    // byMonth
    const monthMap: Record<string, Record<string, number>> = {}
    for (const a of activities) {
      const ym = a.date.toISOString().slice(0, 7)
      if (!monthMap[ym]) monthMap[ym] = { electricity: 0, material: 0, transport: 0 }
      monthMap[ym][a.activityType] = (monthMap[ym][a.activityType] ?? 0) + a.emission
    }
    const byMonth = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cats]) => {
        const [, m] = month.split('-')
        const elec = Math.round((cats.electricity ?? 0) * 100) / 100
        const mat = Math.round((cats.material ?? 0) * 100) / 100
        const trans = Math.round((cats.transport ?? 0) * 100) / 100
        return {
          month,
          label: `${parseInt(m)}월`,
          electricity: elec,
          material: mat,
          transport: trans,
          total: Math.round((elec + mat + trans) * 100) / 100,
        }
      })

    // insights
    const categorySums: Record<string, number> = {}
    for (const [key, val] of Object.entries(categoryMap)) {
      categorySums[key] = val.emission
    }
    const insight = generateInsight(categorySums, total)

    const topEntry = Object.entries(categoryMap).sort((a, b) => b[1].emission - a[1].emission)[0]

    let monthOverMonthChange: number | null = null
    let latestMonth: string | null = null
    if (byMonth.length >= 2) {
      const last = byMonth[byMonth.length - 1]
      const prev = byMonth[byMonth.length - 2]
      latestMonth = last.month
      if (prev.total > 0) {
        monthOverMonthChange = Math.round(((last.total - prev.total) / prev.total) * 1000) / 10
      }
    } else if (byMonth.length === 1) {
      latestMonth = byMonth[0].month
    }

    return NextResponse.json({
      summary: { total: Math.round(total * 100) / 100, totalCount },
      byCategory,
      byScope,
      byMonth,
      insights: {
        topCategory: topEntry?.[0] ?? null,
        topCategoryPercent: topEntry ? Math.round((topEntry[1].emission / total) * 1000) / 10 : 0,
        message: insight.message,
        level: insight.level,
        monthOverMonthChange,
        latestMonth,
      },
    })
  } catch (error) {
    console.error('[GET /api/emissions]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
