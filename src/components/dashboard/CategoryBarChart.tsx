'use client'
import { useEffect, useState } from 'react'
import type { CategoryStats } from '@/types'

interface Props {
  byCategory: Record<string, CategoryStats>
}

const COLORS: Record<string, string> = {
  electricity: 'var(--color-electricity)',
  material: 'var(--color-material)',
  transport: 'var(--color-transport)',
}
const NAMES: Record<string, string> = { electricity: '전기', material: '원소재', transport: '운송' }
const SCOPES: Record<string, string> = { electricity: 'Scope 2', material: 'Scope 3', transport: 'Scope 3' }

export default function CategoryBarChart({ byCategory }: Props) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 150); return () => clearTimeout(t) }, [])

  const cats = ['electricity', 'material', 'transport']
  const vals = cats.map(c => byCategory[c]?.emission ?? 0)
  const total = vals.reduce((a, b) => a + b, 0)
  const maxV = Math.max(...vals) * 1.15

  const W = 340, H = 240, PL = 44, PR = 12, PT = 44, PB = 52
  const cW = W - PL - PR, cH = H - PT - PB
  const bW = (cW / 3) * 0.55
  const gap = cW / 3
  const bX = (i: number) => PL + gap * i + (gap - bW) / 2
  const bH = (v: number) => (v / maxV) * cH
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ v: Math.round(maxV * p / 1000), y: cH - cH * p + PT }))

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {yTicks.map(({ v, y }) => (
        <g key={v}>
          <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--chart-grid)" strokeWidth={0.75} />
          <text x={PL - 6} y={y + 4} textAnchor="end" fontSize={9} fill="var(--text-muted)" fontFamily="DM Mono">{v}k</text>
        </g>
      ))}
      {cats.map((c, i) => {
        const v = vals[i]
        const h = bH(v)
        const y = PT + cH - h
        const pct = ((v / total) * 100).toFixed(1)
        return (
          <g key={c}>
            <rect
              x={bX(i)}
              y={animated ? y : PT + cH}
              width={bW}
              height={animated ? h : 0}
              rx={3}
              fill={COLORS[c]}
              style={{ transition: 'y 0.8s ease-out, height 0.8s ease-out' }}
            />
            {animated && (
              <>
                <text x={bX(i) + bW / 2} y={y - 18} textAnchor="middle" fontSize={10} fill="var(--text-primary)" fontFamily="DM Mono">
                  {(v / 1000).toFixed(1)}k
                </text>
                <text x={bX(i) + bW / 2} y={y - 6} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="DM Mono">
                  {pct}%
                </text>
              </>
            )}
            <text x={bX(i) + bW / 2} y={PT + cH + 16} textAnchor="middle" fontSize={11} fill="var(--text-secondary)" fontFamily="Syne">
              {NAMES[c]}
            </text>
            <text x={bX(i) + bW / 2} y={PT + cH + 30} textAnchor="middle" fontSize={9} fill="var(--text-muted)" fontFamily="DM Mono">
              {SCOPES[c]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
