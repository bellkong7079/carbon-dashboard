'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts'
import { ACTIVITY_TYPE_LABELS } from '@/lib/emissions'
import { formatEmission } from '@/lib/format'
import type { CategoryStats } from '@/types'

interface Props {
  byCategory: Record<string, CategoryStats>
}

const COLORS: Record<string, string> = {
  electricity: '#60a5fa',
  material: '#a78bfa',
  transport: '#34d399',
}

const SCOPE_MAP: Record<string, string> = {
  electricity: 'Scope 2',
  material: 'Scope 3',
  transport: 'Scope 3',
}

function CustomLabel({ x = 0, y = 0, width = 0, value, percent }: {
  x?: number; y?: number; width?: number; value?: number; percent?: number
}) {
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="#e5e7eb">
      {value !== undefined ? `${formatEmission(value)}` : ''} {percent !== undefined ? `(${percent}%)` : ''}
    </text>
  )
}

export default function CategoryBarChart({ byCategory }: Props) {
  const data = Object.entries(byCategory).map(([key, val]) => ({
    key,
    name: ACTIVITY_TYPE_LABELS[key] ?? key,
    scope: SCOPE_MAP[key] ?? '',
    emission: val.emission,
    percent: val.percent,
  }))

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">카테고리별 배출량</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis
            dataKey="name"
            tick={({ x, y, payload }: { x: number; y: number; payload: { value: string } }) => {
              const item = data.find((d) => d.name === payload.value)
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={14} textAnchor="middle" fontSize={12} fill="#e5e7eb">{payload.value}</text>
                  <text x={0} y={0} dy={28} textAnchor="middle" fontSize={10} fill="#6b7280">{item?.scope ?? ''}</text>
                </g>
              )
            }}
            axisLine={false}
            tickLine={false}
            height={50}
          />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]
              return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
                  <p className="font-semibold text-white">{item.payload.name} ({item.payload.scope})</p>
                  <p className="text-gray-300 mt-1">{formatEmission(item.payload.emission)}</p>
                  <p className="text-gray-400">{item.payload.percent}%</p>
                </div>
              )
            }}
          />
          <Bar dataKey="emission" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={COLORS[entry.key] ?? '#6b7280'} />
            ))}
            <LabelList
              content={(props) => <CustomLabel {...props as { x?: number; y?: number; width?: number }} value={props.value as number} percent={data.find((d) => d.emission === props.value)?.percent} />}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
