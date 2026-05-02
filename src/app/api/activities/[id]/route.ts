import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * @swagger
 * /api/activities/{id}:
 *   delete:
 *     tags: [activities]
 *     summary: 활동 데이터 삭제
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 성공
 *       404:
 *         description: 데이터를 찾을 수 없음
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existing = await prisma.activity.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: '데이터를 찾을 수 없습니다' }, { status: 404 })
    }

    await prisma.activity.delete({ where: { id: params.id } })
    return NextResponse.json({ message: '삭제되었습니다' })
  } catch (error) {
    console.error('[DELETE /api/activities/[id]]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
