export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    await prisma.emissionFactor.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE /api/emission-factors/[id]]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
