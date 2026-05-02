import { NextResponse } from 'next/server'
import { getApiDocs } from '../../../../swagger.config'

export async function GET() {
  try {
    const spec = getApiDocs()
    return NextResponse.json(spec)
  } catch (error) {
    console.error('[GET /api/swagger]', error)
    return NextResponse.json({ error: 'Swagger 스펙 생성 실패' }, { status: 500 })
  }
}
