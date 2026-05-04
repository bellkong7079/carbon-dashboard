'use client'
import { useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Version {
  id: string
  factor: number
  source: string
  validFrom: string
  validTo: string | null
  createdAt: string
}

interface Factor {
  id: string
  key: string
  name: string
  unit: string
  activityType: string
  createdAt: string
  versions: Version[]
}

const ACTIVITY_LABEL: Record<string, string> = {
  electricity: '전기',
  material: '원소재',
  transport: '운송',
}

const SCOPE_LABEL: Record<string, string> = {
  electricity: 'Scope 2',
  material: 'Scope 3',
  transport: 'Scope 3',
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function EmissionFactorsPage() {
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/emission-factors?versions=all')
      .then(r => r.ok ? r.json() : [])
      .then((data: unknown) => setFactors(Array.isArray(data) ? data as Factor[] : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })

  const grouped = factors.reduce<Record<string, Factor[]>>((acc, f) => {
    ;(acc[f.activityType] ??= []).push(f)
    return acc
  }, {})

  const SL: React.CSSProperties = { fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--text-muted)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        title="배출계수 이력"
        description="GHG Protocol 기준 배출계수 버전 이력 — 감사 추적(audit trail) 보장"
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 설명 카드 */}
        <div style={{ padding: '14px 18px', borderRadius: 10, border: '1px solid rgba(34,211,238,.2)', background: 'var(--color-accent-bg)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, marginTop: 1 }}>📋</span>
          <div>
            <p style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
              배출계수 스냅샷 설계
            </p>
            <p style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              환경부는 매년 전기 배출계수를 고시합니다. 새 계수로 과거 데이터를 재계산하면 역사적 추세 비교가 불가능합니다.
              <br />
              이 시스템은 <strong style={{ color: 'var(--color-accent)' }}>활동 등록 시점의 계수를 스냅샷으로 저장</strong>하고, 계수 변경 이력을 버전으로 관리합니다.
            </p>
          </div>
        </div>

        {loading ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>로딩 중...</p>
        ) : (
          Object.entries(grouped).map(([actType, typeFactors]) => (
            <section key={actType}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {ACTIVITY_LABEL[actType] ?? actType}
                </span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  {SCOPE_LABEL[actType] ?? ''}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
              </div>

              {/* Factor cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {typeFactors.map(f => {
                  const current = f.versions.find(v => !v.validTo)
                  const isOpen = expanded.has(f.id)
                  return (
                    <div key={f.id} style={{ borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
                      {/* Factor row */}
                      <button
                        type="button"
                        onClick={() => toggle(f.id)}
                        style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', alignItems: 'center', gap: 16, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{f.name}</p>
                          <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{f.key}</p>
                        </div>

                        {/* Current factor value */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={SL}>현재 계수</p>
                          <p style={{ fontSize: 18, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--color-accent)', fontWeight: 500, marginTop: 2 }}>
                            {current?.factor ?? '—'}
                          </p>
                        </div>

                        {/* Unit */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={SL}>단위</p>
                          <p style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)', marginTop: 2 }}>{f.unit}</p>
                        </div>

                        {/* Version count */}
                        <div style={{ textAlign: 'right' }}>
                          <p style={SL}>버전</p>
                          <p style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)', marginTop: 2 }}>{f.versions.length}개</p>
                        </div>

                        {/* Expand icon */}
                        <div style={{ color: 'var(--text-muted)' }}>
                          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </div>
                      </button>

                      {/* Version history */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--border-faint)', background: 'var(--bg-elevated)' }}>
                          {/* Table header */}
                          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr auto', gap: 12, padding: '8px 18px', borderBottom: '1px solid var(--border-faint)' }}>
                            {['버전', '계수값', '출처', '유효기간 시작', '상태'].map(h => (
                              <p key={h} style={{ ...SL, marginBottom: 0 }}>{h}</p>
                            ))}
                          </div>

                          {f.versions.map((v, i) => {
                            const isCurrent = !v.validTo
                            return (
                              <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr 1fr auto', gap: 12, padding: '11px 18px', borderBottom: i < f.versions.length - 1 ? '1px solid var(--border-faint)' : 'none', alignItems: 'center' }}>
                                <p style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
                                  v{f.versions.length - i}
                                </p>
                                <p style={{ fontSize: 14, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: isCurrent ? 'var(--color-accent)' : 'var(--text-secondary)', fontWeight: isCurrent ? 500 : 400 }}>
                                  {v.factor}
                                </p>
                                <p style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)' }}>
                                  {v.source}
                                </p>
                                <p style={{ fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
                                  {fmt(v.validFrom)}
                                </p>
                                <div>
                                  {isCurrent ? (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,211,238,.12)', border: '1px solid rgba(34,211,238,.3)', fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--color-accent)' }}>
                                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
                                      현재
                                    </span>
                                  ) : (
                                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
                                      만료 {v.validTo ? fmt(v.validTo) : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
