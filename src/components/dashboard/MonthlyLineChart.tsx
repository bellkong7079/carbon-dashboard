'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { MonthlyData } from '@/types'
import { formatEmission } from '@/lib/format'

interface Props {
  data: MonthlyData[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + (p.value ?? 0), 0)
  const scopeMap: Record<string, string> = {
    '전기': 'Scope 2',
    '원소재': 'Scope 3',
    '운송': 'Scope 3',
  }
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs shadow-xl">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 mb-1">
          <span style={{ color: p.color }}>{p.name} <span className="text-gray-500 text-[10px]">({scopeMap[p.name]})</span></span>
          <span className="text-white">{formatEmission(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
        <span className="text-gray-400">합계</span>
        <span className="text-emerald-400 font-semibold">{formatEmission(total)}</span>
      </div>
    </div>
  )
}

export default function MonthlyLineChart({ data }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">월별 배출량 추이</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={60}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const scopeMap: Record<string, string> = {
                electricity: '전기 (Scope 2)',
                material: '원소재 (Scope 3)',
                transport: '운송 (Scope 3)',
              }
              return <span style={{ fontSize: 11, color: '#9ca3af' }}>{scopeMap[value] ?? value}</span>
            }}
          />
          <Line type="monotone" dataKey="electricity" name="electricity" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="material" name="material" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="transport" name="transport" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
