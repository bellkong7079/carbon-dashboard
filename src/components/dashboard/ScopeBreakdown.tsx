'use client'
import { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatEmission } from '@/lib/format'
import { SCOPE_META } from '@/lib/emissions'
import type { ScopeStats } from '@/types'

interface Props {
  byScope: Record<string, ScopeStats>
}

export default function ScopeBreakdown({ byScope }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const scope2 = byScope['scope2'] ?? { emission: 0, percent: 0 }
  const scope3 = byScope['scope3'] ?? { emission: 0, percent: 0 }

  const scopes = [
    { key: 'scope2', label: 'Scope 2', stats: scope2, color: 'bg-blue-500' },
    { key: 'scope3', label: 'Scope 3', stats: scope3, color: 'bg-purple-500' },
  ]

  return (
    <TooltipProvider>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Scope별 배출 비율</h3>

        {/* 수평 비율 바 */}
        <div className="flex h-8 rounded-lg overflow-hidden mb-4">
          <div
            className="bg-blue-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-1000 ease-out"
            style={{ width: mounted ? `${scope2.percent}%` : '0%' }}
          >
            {scope2.percent > 5 ? `${scope2.percent}%` : ''}
          </div>
          <div
            className="bg-purple-500 flex items-center justify-center text-xs font-medium text-white transition-all duration-1000 ease-out"
            style={{ width: mounted ? `${scope3.percent}%` : '0%' }}
          >
            {scope3.percent > 5 ? `${scope3.percent}%` : ''}
          </div>
        </div>

        {/* 범례 */}
        <div className="space-y-3">
          {scopes.map(({ key, label, stats, color }) => {
            const meta = SCOPE_META[key]
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  <span className="text-sm text-gray-300">{label}</span>
                  <Tooltip>
                    <TooltipTrigger
                      render={<span className="w-4 h-4 rounded-full bg-gray-700 text-gray-400 text-[10px] flex items-center justify-center cursor-help hover:bg-gray-600 transition-colors">?</span>}
                    />
                    <TooltipContent side="right" className="max-w-[220px] text-xs bg-gray-800 border-gray-700 text-gray-200">
                      <p className="font-semibold mb-1">{meta.label}</p>
                      <p>{meta.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatEmission(stats.emission)}</p>
                  <p className="text-xs text-gray-500">{stats.percent.toFixed(1)}%</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
