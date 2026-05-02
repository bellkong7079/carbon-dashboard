export function formatEmission(value: number): string {
  return `${value.toLocaleString('ko-KR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} kgCO₂e`
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatChange(value: number): { text: string; colorClass: string } {
  const abs = Math.abs(value).toFixed(1)
  return value > 0
    ? { text: `▲ ${abs}%`, colorClass: 'text-red-400' }
    : { text: `▼ ${abs}%`, colorClass: 'text-emerald-400' }
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

export function formatMonthLabel(ym: string): string {
  const [, month] = ym.split('-')
  return `${parseInt(month)}월`
}
