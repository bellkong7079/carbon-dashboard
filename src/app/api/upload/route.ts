import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateEmission, resolveScope, ACTIVITY_TYPE_UNITS, DESCRIPTION_TO_FACTOR_KEY } from '@/lib/emissions'
import * as XLSX from 'xlsx'

const ACTIVITY_TYPE_MAP: Record<string, string> = {
  '전기': 'electricity',
  '원소재': 'material',
  '운송': 'transport',
}

/**
 * @swagger
 * /api/upload:
 *   post:
 *     tags: [upload]
 *     summary: Excel 파일 업로드로 활동 데이터 일괄 등록
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 업로드 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inserted:
 *                   type: integer
 *                 skipped:
 *                   type: integer
 *       400:
 *         description: 잘못된 파일 형식
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext !== 'xlsx' && ext !== 'xls') {
      return NextResponse.json({ error: '.xlsx 또는 .xls 파일만 업로드 가능합니다' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

    let inserted = 0
    let skipped = 0

    for (const row of rows) {
      const dateRaw = row['일자(원본)'] ?? row['일자'] ?? row['date']
      const typeRaw = row['활동 유형'] ?? row['activityType']
      const descRaw = row['설명'] ?? row['description']
      const amountRaw = row['량'] ?? row['amount']

      if (!dateRaw || !typeRaw || !descRaw || !amountRaw) {
        skipped++
        continue
      }

      const activityType = ACTIVITY_TYPE_MAP[String(typeRaw)] ?? String(typeRaw)
      const description = String(descRaw)
      const amount = typeof amountRaw === 'number' ? amountRaw : parseFloat(String(amountRaw))
      const date = new Date(String(dateRaw))

      if (isNaN(date.getTime()) || isNaN(amount) || amount <= 0) {
        skipped++
        continue
      }

      // 중복 감지
      const duplicate = await prisma.activity.findFirst({
        where: {
          date,
          activityType,
          description,
          amount,
        },
      })
      if (duplicate) {
        skipped++
        continue
      }

      const factorKey = DESCRIPTION_TO_FACTOR_KEY[description]
      if (!factorKey) {
        skipped++
        continue
      }

      const efVersion = await prisma.emissionFactorVersion.findFirst({
        where: { emissionFactor: { key: factorKey }, validTo: null },
        orderBy: { validFrom: 'desc' },
      })
      if (!efVersion) {
        skipped++
        continue
      }

      const scope = resolveScope(activityType)
      const unit = ACTIVITY_TYPE_UNITS[activityType] ?? String(row['단위'] ?? '')
      const emission = calculateEmission(amount, efVersion.factor)

      await prisma.activity.create({
        data: {
          date,
          activityType,
          description,
          amount,
          unit,
          emissionFactor: efVersion.factor,
          emission,
          scope,
        },
      })
      inserted++
    }

    return NextResponse.json({ inserted, skipped })
  } catch (error) {
    console.error('[POST /api/upload]', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
