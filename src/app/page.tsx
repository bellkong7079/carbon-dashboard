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
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header
          title="탄소 배출 현황"
          description="2025년 1월 — 8월 · CT-045 컴퓨터 화면"
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 13, color: 'var(--text-muted)' }}>
              데이터를 불러올 수 없습니다.
            </p>
            <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: 'var(--text-disabled)', marginTop: 8 }}>
              DB 연결 상태를 확인하세요:{' '}
              <code style={{ color: 'var(--text-muted)' }}>docker-compose up -d</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        title="탄소 배출 현황"
        description="2025년 1월 — 8월 · CT-045 컴퓨터 화면"
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <InsightBanner message={data.insights.message} level={data.insights.level} />

        <Suspense fallback={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20, height: 120 }} />
            ))}
          </div>
        }>
          <SummaryCards data={data} />
        </Suspense>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>
          <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>월별 배출 추이</h3>
              <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>2025년 1월 ~ 8월</p>
            </div>
            <MonthlyLineChart data={data.byMonth} />
          </div>
          <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>카테고리별 비중</h3>
              <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>전체 기간 누적</p>
            </div>
            <CategoryBarChart byCategory={data.byCategory} />
          </div>
        </div>

        <ScopeBreakdown byScope={data.byScope} />
      </div>
    </div>
  )
}
