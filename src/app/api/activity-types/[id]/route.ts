export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const factorCount = await prisma.emissionFactor.count({ where: { activityType: id } })
    if (factorCount > 0) {
      return NextResponse.json(
        { error: '이 활동 유형에 연결된 배출계수가 있습니다. 먼저 배출계수를 삭제하세요.' },
        { status: 409 }
      )
    }

    await prisma.activityType.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/activity-types/[id]]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
