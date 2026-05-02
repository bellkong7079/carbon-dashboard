import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatEmission, formatChange } from '@/lib/format'
import { ACTIVITY_TYPE_LABELS } from '@/lib/emissions'
import type { EmissionsResponse } from '@/types'

interface SummaryCardsProps {
  data: EmissionsResponse
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const { summary, byCategory, byScope, insights } = data

  const changeInfo =
    insights.monthOverMonthChange !== null
      ? formatChange(insights.monthOverMonthChange)
      : null

  const topLabel = insights.topCategory ? ACTIVITY_TYPE_LABELS[insights.topCategory] ?? insights.topCategory : '-'

  const scope2 = byScope['scope2'] ?? { emission: 0, percent: 0 }
  const scope3 = byScope['scope3'] ?? { emission: 0, percent: 0 }
  const scope3Count = (byCategory['material']?.count ?? 0) + (byCategory['transport']?.count ?? 0)

  const cards = [
    {
      title: '총 탄소 배출량',
      value: formatEmission(summary.total),
      sub: changeInfo
        ? <span className={`text-xs ${changeInfo.colorClass}`}>전월 대비 {changeInfo.text}</span>
        : <span className="text-xs text-gray-500">데이터 {summary.totalCount}건</span>,
      accent: 'text-emerald-400',
    },
    {
      title: '최대 배출원',
      value: topLabel,
      sub: <span className="text-xs text-gray-400">{insights.topCategoryPercent.toFixed(1)}% 차지</span>,
      accent: 'text-orange-400',
    },
    {
      title: 'Scope 2 (전기)',
      value: formatEmission(scope2.emission),
      sub: <span className="text-xs text-gray-400">{byCategory['electricity']?.count ?? 0}건 · {scope2.percent.toFixed(1)}%</span>,
      accent: 'text-blue-400',
    },
    {
      title: 'Scope 3 (공급망)',
      value: formatEmission(scope3.emission),
      sub: <span className="text-xs text-gray-400">원소재 + 운송 {scope3Count}건 · {scope3.percent.toFixed(1)}%</span>,
      accent: 'text-purple-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-lg font-bold ${card.accent} leading-tight`}>{card.value}</p>
            <div className="mt-1">{card.sub}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
