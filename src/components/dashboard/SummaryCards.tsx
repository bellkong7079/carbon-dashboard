'use client'
import { useEffect, useRef, useState } from 'react'
import type { EmissionsResponse } from '@/types'

interface Props {
  data: EmissionsResponse
}

function CountUpNumber({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef<number>()
  const startRef = useRef<number>()

  useEffect(() => {
    startRef.current = undefined
    const duration = 1000
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now
      const progress = Math.min((now - startRef.current) / duration, 1)
      setDisplay(value * easeOut(progress))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current!)
  }, [value])

  return (
    <span>
      {display.toLocaleString('ko-KR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}

const CARD_THEME: Record<string, { color: string; iconBg: string; iconSvg: string }> = {
  total: {
    color: 'var(--color-accent)',
    iconBg: 'var(--color-accent-bg)',
    iconSvg: '<circle cx="8" cy="8" r="6" stroke="#22d3ee" stroke-width="1.4"/><path d="M8 5v3l2 2" stroke="#22d3ee" stroke-width="1.3" stroke-linecap="round"/>',
  },
  top: {
    color: 'var(--color-warning)',
    iconBg: 'var(--color-warning-bg)',
    iconSvg: '<path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11 4.4 13l.7-4L2.2 6.2l4-.6L8 2z" stroke="#fbbf24" stroke-width="1.3" stroke-linejoin="round"/>',
  },
  scope2: {
    color: 'var(--color-electricity)',
    iconBg: 'var(--color-electricity-bg)',
    iconSvg: '<path d="M9 2L5 9h4l-2 5 6-7H9L11 2z" stroke="#38bdf8" stroke-width="1.3" stroke-linejoin="round"/>',
  },
  scope3: {
    color: 'var(--color-material)',
    iconBg: 'var(--color-material-bg)',
    iconSvg: '<rect x="1" y="7" width="14" height="7" rx="1.5" stroke="#fb923c" stroke-width="1.3"/><path d="M3 7V5a3 3 0 016 0v2" stroke="#fb923c" stroke-width="1.3" stroke-linecap="round"/>',
  },
}

function MetricCard({
  label,
  value,
  unit,
  themeKey,
  change,
  delay,
}: {
  label: string
  value: number
  unit?: string
  themeKey: string
  change?: number | null
  delay: number
}) {
  const theme = CARD_THEME[themeKey]
  return (
    <div
      className="animate-slide-up"
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: 20,
        animationDelay: `${delay}s`,
        transition: 'border-color 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: theme.color,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
          }}
        >
          {label}
        </span>
        <div
          style={{ padding: 6, borderRadius: 6, background: theme.iconBg, display: 'flex', alignItems: 'center' }}
          dangerouslySetInnerHTML={{
            __html: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none">${theme.iconSvg}</svg>`,
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 4, lineHeight: 1 }}>
        <span
          style={{
            fontSize: 30,
            fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
            fontWeight: 400,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <CountUpNumber value={value} />
        </span>
        {unit && (
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              color: 'var(--text-muted)',
              marginLeft: 3,
            }}
          >
            {unit}
          </span>
        )}
      </div>
      {change != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <svg width={10} height={10} viewBox="0 0 10 10" fill="none">
            {change > 0 ? (
              <polygon points="5,1 9,7 1,7" fill="var(--color-danger)" />
            ) : (
              <polygon points="5,9 9,3 1,3" fill="var(--color-success)" />
            )}
          </svg>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              color: change > 0 ? 'var(--color-danger)' : 'var(--color-success)',
              fontWeight: 500,
            }}
          >
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              color: 'var(--text-muted)',
            }}
          >
            전월 대비
          </span>
        </div>
      )}
    </div>
  )
}

export default function SummaryCards({ data }: Props) {
  const { summary, byCategory, byScope, insights } = data
  const scope2 = byScope['scope2'] ?? { emission: 0, percent: 0 }
  const scope3 = byScope['scope3'] ?? { emission: 0, percent: 0 }

  const cards = [
    { label: '총 배출량', value: summary.total, unit: 'kgCO₂e', themeKey: 'total', change: insights.monthOverMonthChange, delay: 0 },
    { label: '최대 배출원', value: byCategory[insights.topCategory]?.emission ?? 0, unit: 'kgCO₂e', themeKey: 'top', change: null, delay: 0.07 },
    { label: 'Scope 2', value: scope2.emission, unit: 'kgCO₂e', themeKey: 'scope2', change: null, delay: 0.14 },
    { label: 'Scope 3', value: scope3.emission, unit: 'kgCO₂e', themeKey: 'scope3', change: null, delay: 0.21 },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
      {cards.map((card, i) => (
        <MetricCard key={i} {...card} />
      ))}
    </div>
  )
}
