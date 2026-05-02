'use client'
import { useEffect, useState, useRef } from 'react'
import type { MonthlyData } from '@/types'

interface Props {
  data: MonthlyData[]
}

const COLORS = {
  electricity: 'var(--color-electricity)',
  material: 'var(--color-material)',
  transport: 'var(--color-transport)',
}
const LABELS = { electricity: '전기', material: '원소재', transport: '운송' }
const SCOPES = { electricity: 'Scope 2', material: 'Scope 3', transport: 'Scope 3' }
type Key = 'electricity' | 'material' | 'transport'

interface TooltipState {
  x: number
  y: number
  d: MonthlyData
  ki: number
}

export default function MonthlyLineChart({ data }: Props) {
  const [animated, setAnimated] = useState(false)
  const [tip, setTip] = useState<TooltipState | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 100); return () => clearTimeout(t) }, [])

  const W = 620, H = 240, PL = 48, PR = 20, PT = 12, PB = 32
  const cW = W - PL - PR, cH = H - PT - PB
  const keys: Key[] = ['electricity', 'material', 'transport']
  const allVals = data.flatMap(d => [d.electricity, d.material, d.transport])
  const maxV = Math.max(...allVals) * 1.1
  const xStep = cW / (data.length - 1)
  const yScale = (v: number) => cH - (v / maxV) * cH + PT
  const xPos = (i: number) => PL + i * xStep
  const pts = (k: Key) => data.map((d, i) => `${xPos(i)},${yScale(d[k])}`).join(' ')
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ v: Math.round(maxV * p / 1000), y: cH - cH * p + PT }))

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        {/* Grid */}
        {yTicks.map(({ v, y }) => (
          <g key={v}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--chart-grid)" strokeWidth={0.75} />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="var(--text-muted)" fontFamily="DM Mono">{v}k</text>
          </g>
        ))}
        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={xPos(i)} y={H - 4} textAnchor="middle" fontSize={11} fill="var(--text-muted)" fontFamily="DM Mono">{d.label}</text>
        ))}
        {/* Lines + dots */}
        {keys.map((k, ki) => (
          <g key={k}>
            <polyline
              points={pts(k)}
              fill="none"
              stroke={COLORS[k]}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                strokeDasharray: 2000,
                strokeDashoffset: animated ? 0 : 2000,
                transition: 'stroke-dashoffset 1.2s ease-out',
              }}
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={xPos(i)}
                cy={yScale(d[k])}
                r={3}
                fill={COLORS[k]}
                style={{ opacity: animated ? 1 : 0, transition: `opacity .3s ${0.1 + i * 0.05}s`, cursor: 'pointer' }}
                onMouseEnter={e => {
                  const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect()
                  const svgX = (xPos(i) / W) * rect.width + rect.left
                  const svgY = (yScale(d[k]) / H) * rect.height + rect.top
                  setTip({ x: svgX, y: svgY, d, ki })
                }}
                onMouseLeave={() => setTip(null)}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 8 }}>
        {keys.map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 2, borderRadius: 1, background: COLORS[k] }} />
            <span style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)' }}>{LABELS[k]}</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>({SCOPES[k]})</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tip && (
        <div
          style={{
            position: 'fixed',
            left: tip.x + 12,
            top: tip.y - 20,
            zIndex: 9999,
            borderRadius: 8,
            border: '1px solid var(--border-default)',
            background: 'var(--bg-overlay)',
            padding: 12,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,.6)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
            2025년 {tip.d.label}
          </div>
          {keys.map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: COLORS[k] }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{LABELS[k]}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>({SCOPES[k]})</span>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)' }}>
                {tip.d[k].toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kgCO₂e
              </span>
            </div>
          ))}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>합계</span>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontWeight: 500, color: 'var(--text-primary)' }}>
              {(tip.d.electricity + tip.d.material + tip.d.transport).toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kgCO₂e
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
