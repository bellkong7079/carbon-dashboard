export function calculateEmission(amount: number, factor: number): number {
  return Math.round(amount * factor * 100) / 100
}

export const DESCRIPTION_TO_FACTOR_KEY: Record<string, string> = {
  '한국전력': 'electricity_kepco',
  '플라스틱 1': 'material_plastic1',
  '플라스틱 2': 'material_plastic2',
  '트럭': 'transport_truck',
}

export function resolveScope(activityType: string): 'scope2' | 'scope3' {
  return activityType === 'electricity' ? 'scope2' : 'scope3'
}

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  electricity: '전기',
  material: '원소재',
  transport: '운송',
}

export const ACTIVITY_TYPE_UNITS: Record<string, string> = {
  electricity: 'kWh',
  material: 'kg',
  transport: 'ton-km',
}

export const ACTIVITY_TYPE_DESCRIPTIONS: Record<string, string[]> = {
  electricity: ['한국전력'],
  material: ['플라스틱 1', '플라스틱 2'],
  transport: ['트럭'],
}

export const SCOPE_META: Record<string, { label: string; description: string }> = {
  scope2: {
    label: 'Scope 2',
    description: '외부에서 구매·사용한 전기로 인한 간접 배출. GHG Protocol 기준.',
  },
  scope3: {
    label: 'Scope 3',
    description: '원자재 조달, 제품 운송 등 공급망 전반의 간접 배출. GHG Protocol 기준.',
  },
}

export function generateInsight(
  byCategory: Record<string, number>,
  total: number
): { message: string; level: 'info' | 'warning' | 'critical' } {
  const [key, value] = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  const percent = (value / total) * 100
  const label = ACTIVITY_TYPE_LABELS[key]

  if (percent > 80) {
    return {
      message: `🚨 ${label}이(가) 전체 배출량의 ${percent.toFixed(1)}%를 차지합니다. 즉각적인 감축 조치가 필요합니다.`,
      level: 'critical',
    }
  } else if (percent > 60) {
    return {
      message: `⚠️ ${label}이(가) 전체 배출량의 ${percent.toFixed(1)}%를 차지합니다. 대체 소재 또는 공정 개선을 검토하세요.`,
      level: 'warning',
    }
  }
  return {
    message: `✅ 배출원이 비교적 균형 있게 분산되어 있습니다. ${label} 비중이 ${percent.toFixed(1)}%로 가장 높습니다.`,
    level: 'info',
  }
}
