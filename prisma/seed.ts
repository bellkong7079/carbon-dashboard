import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. 활동 유형 마스터
  const activityTypes = [
    { key: 'electricity', label: '전기',   unit: 'kWh',    scope: 'scope2' },
    { key: 'material',   label: '원소재', unit: 'kg',     scope: 'scope3' },
    { key: 'transport',  label: '운송',   unit: 'ton-km', scope: 'scope3' },
  ]

  for (const t of activityTypes) {
    await prisma.activityType.upsert({
      where: { key: t.key },
      update: { label: t.label, unit: t.unit, scope: t.scope },
      create: t,
    })
  }

  // 2. 배출계수 마스터 + 버전
  const factors = [
    { key: 'electricity_kepco', name: '한국전력',   unit: 'kgCO₂e/kWh',    activityType: 'electricity', factor: 0.456, source: '환경부 고시 2024-01' },
    { key: 'material_plastic1', name: '플라스틱 1', unit: 'kgCO₂e/kg',     activityType: 'material',   factor: 2.3,   source: 'Ecoinvent v3.9' },
    { key: 'material_plastic2', name: '플라스틱 2', unit: 'kgCO₂e/kg',     activityType: 'material',   factor: 3.2,   source: 'Ecoinvent v3.9' },
    { key: 'transport_truck',   name: '트럭',       unit: 'kgCO₂e/ton-km', activityType: 'transport',  factor: 3.5,   source: 'IPCC AR6 WG3' },
  ]

  for (const f of factors) {
    const ef = await prisma.emissionFactor.upsert({
      where: { key: f.key },
      update: { name: f.name, activityType: f.activityType },
      create: { key: f.key, name: f.name, unit: f.unit, activityType: f.activityType },
    })
    const existingVersion = await prisma.emissionFactorVersion.findFirst({
      where: { emissionFactorId: ef.id, validTo: null },
    })
    if (!existingVersion) {
      await prisma.emissionFactorVersion.create({
        data: {
          emissionFactorId: ef.id,
          factor: f.factor,
          source: f.source,
          validFrom: new Date('2024-01-01'),
          validTo: null,
        },
      })
    }
  }

  // 3. 활동 데이터 — CT-045 원본 29개 행
  const activities = [
    { date: '2025-01-01', activityType: 'electricity', description: '한국전력',   amount: 110,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-02-01', activityType: 'electricity', description: '한국전력',   amount: 112,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-03-01', activityType: 'electricity', description: '한국전력',   amount: 115,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-04-01', activityType: 'electricity', description: '한국전력',   amount: 130,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-05-01', activityType: 'electricity', description: '한국전력',   amount: 120,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-05-01', activityType: 'electricity', description: '한국전력',   amount: 101,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-06-01', activityType: 'electricity', description: '한국전력',   amount: 110,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-07-01', activityType: 'electricity', description: '한국전력',   amount: 120,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-08-01', activityType: 'electricity', description: '한국전력',   amount: 111,  unit: 'kWh',    factor: 0.456 },
    { date: '2025-01-01', activityType: 'material',   description: '플라스틱 1', amount: 230,  unit: 'kg',     factor: 2.3 },
    { date: '2025-02-01', activityType: 'material',   description: '플라스틱 1', amount: 340,  unit: 'kg',     factor: 2.3 },
    { date: '2025-03-01', activityType: 'material',   description: '플라스틱 1', amount: 430,  unit: 'kg',     factor: 2.3 },
    { date: '2025-03-01', activityType: 'material',   description: '플라스틱 2', amount: 23,   unit: 'kg',     factor: 3.2 },
    { date: '2025-04-01', activityType: 'material',   description: '플라스틱 1', amount: 510,  unit: 'kg',     factor: 2.3 },
    { date: '2025-05-01', activityType: 'material',   description: '플라스틱 1', amount: 424,  unit: 'kg',     factor: 2.3 },
    { date: '2025-05-01', activityType: 'material',   description: '플라스틱 1', amount: 232,  unit: 'kg',     factor: 2.3 },
    { date: '2025-05-01', activityType: 'material',   description: '플라스틱 2', amount: 40,   unit: 'kg',     factor: 3.2 },
    { date: '2025-06-01', activityType: 'material',   description: '플라스틱 1', amount: 450,  unit: 'kg',     factor: 2.3 },
    { date: '2025-07-01', activityType: 'material',   description: '플라스틱 1', amount: 340,  unit: 'kg',     factor: 2.3 },
    { date: '2025-07-01', activityType: 'material',   description: '플라스틱 2', amount: 43,   unit: 'kg',     factor: 3.2 },
    { date: '2025-08-01', activityType: 'material',   description: '플라스틱 1', amount: 230,  unit: 'kg',     factor: 2.3 },
    { date: '2025-01-01', activityType: 'transport',  description: '트럭',       amount: 41,  unit: 'ton-km', factor: 3.5 },
    { date: '2025-02-01', activityType: 'transport',  description: '트럭',       amount: 211, unit: 'ton-km', factor: 3.5 },
    { date: '2025-03-01', activityType: 'transport',  description: '트럭',       amount: 123, unit: 'ton-km', factor: 3.5 },
    { date: '2025-04-01', activityType: 'transport',  description: '트럭',       amount: 42,  unit: 'ton-km', factor: 3.5 },
    { date: '2025-05-01', activityType: 'transport',  description: '트럭',       amount: 123, unit: 'ton-km', factor: 3.5 },
    { date: '2025-05-01', activityType: 'transport',  description: '트럭',       amount: 12,  unit: 'ton-km', factor: 3.5 },
    { date: '2025-06-01', activityType: 'transport',  description: '트럭',       amount: 123, unit: 'ton-km', factor: 3.5 },
    { date: '2025-07-01', activityType: 'transport',  description: '트럭',       amount: 41,  unit: 'ton-km', factor: 3.5 },
    { date: '2025-08-01', activityType: 'transport',  description: '트럭',       amount: 123, unit: 'ton-km', factor: 3.5 },
  ]

  for (const a of activities) {
    const scope = a.activityType === 'electricity' ? 'scope2' : 'scope3'
    await prisma.activity.create({
      data: {
        date: new Date(a.date),
        activityType: a.activityType,
        description: a.description,
        amount: a.amount,
        unit: a.unit,
        emissionFactor: a.factor,
        emission: Math.round(a.amount * a.factor * 100) / 100,
        scope,
      },
    })
  }

  console.log('✅ Seed complete: 3 activity types + 4 emission factors + 30 activities')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
