import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import SummaryCards from '@/components/dashboard/SummaryCards'
import InsightBanner from '@/components/dashboard/InsightBanner'
import MonthlyLineChart from '@/components/dashboard/MonthlyLineChart'
import CategoryBarChart from '@/components/dashboard/CategoryBarChart'
import ScopeBreakdown from '@/components/dashboard/ScopeBreakdown'
import type { EmissionsResponse } from '@/types'

async function getEmissions(): Promise<EmissionsResponse | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/emissions`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getEmissions()

  if (!data) {
    return (
      <div>
        <Header
          title="PCF 탄소 배출 대시보드"
          description="GHG Protocol 기준 Scope 2 / Scope 3 배출량 현황"
        />
        <div className="rounded-xl bg-gray-900 border border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-sm">데이터를 불러올 수 없습니다.</p>
          <p className="text-gray-600 text-xs mt-2">DB 연결 상태를 확인하세요: <code className="text-gray-500">docker-compose up -d</code></p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Header
        title="PCF 탄소 배출 대시보드"
        description="GHG Protocol 기준 Scope 2 / Scope 3 배출량 현황"
      />

      <InsightBanner message={data.insights.message} level={data.insights.level} />

      <Suspense fallback={null}>
        <SummaryCards data={data} />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <MonthlyLineChart data={data.byMonth} />
        </div>
        <div>
          <ScopeBreakdown byScope={data.byScope} />
        </div>
      </div>

      <CategoryBarChart byCategory={data.byCategory} />
    </div>
  )
}
