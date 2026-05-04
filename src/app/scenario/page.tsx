'use client'
import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Activity, EmissionFactor } from '@/types'

/* ── 유틸 ─────────────────────────────────────────── */
function round2(n: number) { return Math.round(n * 100) / 100 }

function pctColor(diff: number) {
  if (diff < -0.5) return 'var(--color-success)'
  if (diff > 0.5) return 'var(--color-danger)'
  return 'var(--text-muted)'
}

/* ── 슬라이더 ─────────────────────────────────────── */
function Slider({ label, unit, value, onChange, min = -80, max = 20 }: {
  label: string; unit: string; value: number; onChange: (v: number) => void
  min?: number; max?: number
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: 14, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: value < 0 ? 'var(--color-success)' : value > 0 ? 'var(--color-danger)' : 'var(--text-muted)', fontWeight: 500, minWidth: 60, textAlign: 'right' }}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--color-accent)', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{min}%</span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{unit}</span>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>+{max}%</span>
      </div>
    </div>
  )
}

/* ── KPI 카드 ─────────────────────────────────────── */
function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '16px 20px', borderRadius: 10, border: `1px solid ${highlight ? 'rgba(34,211,238,.3)' : 'var(--border-subtle)'}`, background: highlight ? 'var(--color-accent-bg)' : 'var(--bg-surface)' }}>
      <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em', color: highlight ? 'rgba(34,211,238,.7)' : 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: highlight ? 'var(--color-accent)' : 'var(--text-primary)', fontWeight: 500, letterSpacing: '-0.02em' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginTop: 4 }}>{sub}</p>}
    </div>
  )
}

/* ── 메인 페이지 ──────────────────────────────────── */
export default function ScenarioPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [loading, setLoading] = useState(true)

  // 시나리오 상태
  const [elecPct, setElecPct] = useState(0)
  const [matPct, setMatPct] = useState(0)
  const [transPct, setTransPct] = useState(0)
  const [matFactorKey, setMatFactorKey] = useState<string>('') // 원소재 계수 교체

  useEffect(() => {
    Promise.all([
      fetch('/api/activities?limit=9999&sortBy=date&order=asc').then(r => r.ok ? r.json() : { data: [] }),
      fetch('/api/emission-factors').then(r => r.ok ? r.json() : []),
    ]).then(([acts, facs]) => {
      setActivities(Array.isArray(acts.data) ? acts.data : [])
      const fArr: EmissionFactor[] = Array.isArray(facs) ? facs : []
      setFactors(fArr)
      const defaultMat = fArr.find(f => f.activityType === 'material')
      if (defaultMat) setMatFactorKey(defaultMat.key)
    }).finally(() => setLoading(false))
  }, [])

  const matFactors = factors.filter(f => f.activityType === 'material')
  const overrideFactor = factors.find(f => f.key === matFactorKey)

  // 시나리오 계산
  const { baseline, simulated } = useMemo(() => {
    const baseline = { electricity: 0, material: 0, transport: 0 }
    const simulated = { electricity: 0, material: 0, transport: 0 }

    for (const a of activities) {
      if (a.activityType === 'electricity') {
        baseline.electricity += a.emission
        simulated.electricity += round2(a.emission * (1 + elecPct / 100))
      } else if (a.activityType === 'material') {
        baseline.material += a.emission
        // 계수 교체 시: amount × newFactor, 아니면 quantity 변화만
        if (overrideFactor?.currentFactor != null) {
          simulated.material += round2(a.amount * overrideFactor.currentFactor * (1 + matPct / 100))
        } else {
          simulated.material += round2(a.emission * (1 + matPct / 100))
        }
      } else if (a.activityType === 'transport') {
        baseline.transport += a.emission
        simulated.transport += round2(a.emission * (1 + transPct / 100))
      }
    }

    return { baseline, simulated }
  }, [activities, elecPct, matPct, transPct, overrideFactor])

  const baseTotal = round2(baseline.electricity + baseline.material + baseline.transport)
  const simTotal = round2(simulated.electricity + simulated.material + simulated.transport)
  const saving = round2(baseTotal - simTotal)
  const savingPct = baseTotal > 0 ? round2((saving / baseTotal) * 100) : 0

  const chartData = [
    { name: '전기', 기존: round2(baseline.electricity), 시나리오: round2(simulated.electricity) },
    { name: '원소재', 기존: round2(baseline.material), 시나리오: round2(simulated.material) },
    { name: '운송', 기존: round2(baseline.transport), 시나리오: round2(simulated.transport) },
  ]

  // 인사이트
  const insight = useMemo(() => {
    if (saving === 0) return null
    const diffs = [
      { label: '전기', diff: baseline.electricity - simulated.electricity },
      { label: '원소재', diff: baseline.material - simulated.material },
      { label: '운송', diff: baseline.transport - simulated.transport },
    ].filter(d => d.diff > 0).sort((a, b) => b.diff - a.diff)

    const top = diffs[0]
    if (!top) return null
    const topPct = round2((top.diff / baseTotal) * 100)

    if (saving > 0) {
      return `${top.label} 변경이 가장 큰 감축 효과입니다. 전체 배출량의 ${topPct}% (${round2(top.diff)} kgCO₂e)를 줄일 수 있습니다.`
    }
    return `현재 시나리오는 배출량을 ${Math.abs(savingPct)}% 증가시킵니다. 슬라이더를 조정하세요.`
  }, [saving, baseline, simulated, baseTotal, savingPct])

  const isChanged = elecPct !== 0 || matPct !== 0 || transPct !== 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        title="감축 시나리오 시뮬레이터"
        description="가정값을 조정하여 배출량 변화를 실시간으로 확인하는 What-if 분석"
        action={
          isChanged ? (
            <button onClick={() => { setElecPct(0); setMatPct(0); setTransPct(0) }}
              style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
              초기화
            </button>
          ) : undefined
        }
      />

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>데이터 로딩 중...</p>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>

          {/* ── 좌측: 시나리오 패널 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>
            <div style={{ padding: '18px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)', marginBottom: 18 }}>시나리오 가정값 설정</p>

              <Slider label="전기 사용량" unit="kWh 변화" value={elecPct} onChange={setElecPct} />
              <Slider label="원소재 사용량" unit="kg 변화" value={matPct} onChange={setMatPct} />
              <Slider label="운송 거리" unit="ton-km 변화" value={transPct} onChange={setTransPct} />

              {/* 원소재 계수 교체 */}
              {matFactors.length > 1 && (
                <div style={{ marginTop: 4, paddingTop: 16, borderTop: '1px solid var(--border-faint)' }}>
                  <p style={{ fontSize: 12, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-secondary)', marginBottom: 8 }}>원소재 배출계수 변경</p>
                  <select value={matFactorKey} onChange={e => setMatFactorKey(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}>
                    {matFactors.map(f => (
                      <option key={f.key} value={f.key}>{f.name} ({f.currentFactor} {f.unit})</option>
                    ))}
                  </select>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginTop: 5 }}>
                    원소재 계수 변경 시 모든 원소재 활동에 적용됩니다
                  </p>
                </div>
              )}
            </div>

            {/* 설명 카드 */}
            <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid var(--border-faint)', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                실제 DB 데이터는 변경되지 않습니다.<br />
                모든 계산은 클라이언트에서만 수행됩니다.
              </p>
            </div>
          </div>

          {/* ── 우측: 결과 ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* KPI 카드 3개 */}
            <div style={{ display: 'flex', gap: 12 }}>
              <KpiCard label="기존 배출량" value={`${baseTotal.toLocaleString('ko-KR')} kgCO₂e`} sub="현재 데이터 기준" />
              <KpiCard label="시나리오 배출량" value={`${simTotal.toLocaleString('ko-KR')} kgCO₂e`} sub="가정값 적용 후" />
              <KpiCard
                label={saving >= 0 ? '절감량' : '증가량'}
                value={`${saving >= 0 ? '↓' : '↑'} ${Math.abs(saving).toLocaleString('ko-KR')} kgCO₂e`}
                sub={`${saving >= 0 ? '-' : '+'}${Math.abs(savingPct)}%`}
                highlight={saving > 0}
              />
            </div>

            {/* 인사이트 */}
            {insight && (
              <div style={{ padding: '12px 16px', borderRadius: 8, border: `1px solid ${saving > 0 ? 'rgba(34,211,238,.2)' : 'rgba(239,68,68,.2)'}`, background: saving > 0 ? 'var(--color-accent-bg)' : 'rgba(239,68,68,.05)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16 }}>{saving > 0 ? '💡' : '⚠️'}</span>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: saving > 0 ? 'var(--color-accent)' : 'var(--color-danger)', lineHeight: 1.6 }}>{insight}</p>
              </div>
            )}

            {/* 카테고리별 비교 바 차트 */}
            <div style={{ padding: '20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>카테고리별 배출량 비교</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="30%">
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 8, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12 }}
                    formatter={(v) => [`${Number(v).toLocaleString('ko-KR')} kgCO₂e`]}
                  />
                  <Bar dataKey="기존" fill="rgba(148,163,184,.35)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="시나리오" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => {
                      const diff = entry['시나리오'] - entry['기존']
                      return <Cell key={i} fill={diff < 0 ? 'rgba(34,211,238,.7)' : diff > 0 ? 'rgba(239,68,68,.7)' : 'rgba(148,163,184,.35)'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                {[{ color: 'rgba(148,163,184,.5)', label: '기존' }, { color: 'rgba(34,211,238,.7)', label: '감소' }, { color: 'rgba(239,68,68,.7)', label: '증가' }].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 카테고리별 상세 수치 */}
            <div style={{ padding: '18px 20px', borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
              <p style={{ fontSize: 12, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 14 }}>항목별 변화</p>
              {(['electricity', 'material', 'transport'] as const).map(key => {
                const labels: Record<string, string> = { electricity: '전기', material: '원소재', transport: '운송' }
                const base = round2(baseline[key])
                const sim = round2(simulated[key])
                const diff = round2(sim - base)
                const diffPct = base > 0 ? round2((diff / base) * 100) : 0
                return (
                  <div key={key} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 80px', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: key !== 'transport' ? '1px solid var(--border-faint)' : 'none' }}>
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-primary)' }}>{labels[key]}</span>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, background: 'var(--color-accent)', width: `${baseTotal > 0 ? Math.min((sim / baseTotal) * 100, 100) : 0}%`, transition: 'width .3s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)', textAlign: 'right' }}>{sim.toLocaleString('ko-KR')} kgCO₂e</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: pctColor(diff), textAlign: 'right', fontWeight: 500 }}>
                      {diff === 0 ? '—' : `${diff > 0 ? '+' : ''}${diffPct}%`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
