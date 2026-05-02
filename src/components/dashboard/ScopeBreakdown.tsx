'use client'
import { useEffect, useState } from 'react'
import type { ScopeStats } from '@/types'

interface Props {
  byScope: Record<string, ScopeStats>
}

export default function ScopeBreakdown({ byScope }: Props) {
  const [mounted, setMounted] = useState(false)
  const [tip, setTip] = useState<{ x: number; y: number; desc: string } | null>(null)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 120); return () => clearTimeout(t) }, [])

  const scope2 = byScope['scope2'] ?? { emission: 0, percent: 0 }
  const scope3 = byScope['scope3'] ?? { emission: 0, percent: 0 }

  const rows = [
    {
      key: 'scope2', label: 'Scope 2', sub: '전기 사용',
      color: 'var(--color-electricity)', val: scope2.emission, pct: scope2.percent,
      desc: '외부에서 구매·사용한 전기로 인한 간접 배출. GHG Protocol 기준.',
    },
    {
      key: 'scope3', label: 'Scope 3', sub: '원소재 + 운송',
      color: 'var(--color-material)', val: scope3.emission, pct: scope3.percent,
      desc: '원자재 조달, 제품 운송 등 공급망 전반의 간접 배출. GHG Protocol 기준.',
    },
  ]

  return (
    <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 20, position: 'relative' }}>
      <h3 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: 'var(--text-primary)', marginBottom: 20 }}>
        GHG 배출 범위 분류
      </h3>
      {rows.map(({ key, label, sub, color, val, pct, desc }) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)' }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {sub}</span>
              <button
                style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--bg-elevated)', border: 'none', cursor: 'help', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 9, fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}
                onMouseEnter={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  setTip({ x: r.right + 8, y: r.top, desc })
                }}
                onMouseLeave={() => setTip(null)}
              >?</button>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)' }}>{pct.toFixed(1)}%</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginLeft: 8 }}>
                {val.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kgCO₂e
              </span>
            </div>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 99, background: color, width: mounted ? `${pct}%` : '0%', transition: 'width 1s ease-out' }} />
          </div>
        </div>
      ))}
      {tip && (
        <div style={{ position: 'fixed', left: tip.x, top: tip.y, zIndex: 9999, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: 'var(--text-secondary)', maxWidth: 260, pointerEvents: 'none', boxShadow: '0 8px 32px rgba(0,0,0,.6)', lineHeight: 1.5 }}>
          {tip.desc}
        </div>
      )}
    </div>
  )
}
