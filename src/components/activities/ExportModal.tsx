'use client'
import { useState } from 'react'
import { X, Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import { ACTIVITY_TYPE_LABELS } from '@/lib/emissions'
import type { ActivitiesResponse } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ExportModal({ open, onClose }: Props) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeScope, setIncludeScope] = useState(true)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams({ page: '1', limit: '9999', sortBy: 'date', order: 'desc' })
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)
      const res = await fetch(`/api/activities?${params}`)
      if (!res.ok) return
      const json: ActivitiesResponse = await res.json()

      const wb = XLSX.utils.book_new()

      // Sheet 1: raw activities
      const rawRows = json.data.map(a => ({
        '일자': new Date(a.date).toISOString().slice(0, 10),
        '활동 유형': ACTIVITY_TYPE_LABELS[a.activityType] ?? a.activityType,
        '설명': a.description,
        '량': a.amount,
        '단위': a.unit,
        '배출계수': a.emissionFactor,
        '배출량 (kgCO₂e)': a.emission,
        'Scope': a.scope === 'scope2' ? 'Scope 2' : 'Scope 3',
      }))
      const ws1 = XLSX.utils.json_to_sheet(rawRows)
      ws1['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 10 }]
      XLSX.utils.book_append_sheet(wb, ws1, '활동 데이터')

      // Sheet 2: monthly summary
      if (includeSummary) {
        const monthMap: Record<string, { electricity: number; material: number; transport: number; total: number }> = {}
        for (const a of json.data) {
          const month = new Date(a.date).toISOString().slice(0, 7)
          if (!monthMap[month]) monthMap[month] = { electricity: 0, material: 0, transport: 0, total: 0 }
          const cat = a.activityType as 'electricity' | 'material' | 'transport'
          if (cat in monthMap[month]) monthMap[month][cat] += a.emission
          monthMap[month].total += a.emission
        }
        const summaryRows = Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, v]) => ({
            '월': month,
            '전기 (kgCO₂e)': +v.electricity.toFixed(4),
            '원소재 (kgCO₂e)': +v.material.toFixed(4),
            '운송 (kgCO₂e)': +v.transport.toFixed(4),
            '합계 (kgCO₂e)': +v.total.toFixed(4),
          }))
        const ws2 = XLSX.utils.json_to_sheet(summaryRows)
        ws2['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }]
        XLSX.utils.book_append_sheet(wb, ws2, '월별 요약')
      }

      // Sheet 3: scope breakdown
      if (includeScope) {
        const scopeMap: Record<string, number> = {}
        for (const a of json.data) {
          scopeMap[a.scope] = (scopeMap[a.scope] ?? 0) + a.emission
        }
        const total = Object.values(scopeMap).reduce((s, v) => s + v, 0)
        const scopeRows = Object.entries(scopeMap).map(([scope, emission]) => ({
          'Scope': scope === 'scope2' ? 'Scope 2' : 'Scope 3',
          '배출량 (kgCO₂e)': +emission.toFixed(4),
          '비율 (%)': total > 0 ? +(emission / total * 100).toFixed(2) : 0,
        }))
        const ws3 = XLSX.utils.json_to_sheet(scopeRows)
        ws3['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 12 }]
        XLSX.utils.book_append_sheet(wb, ws3, 'Scope 분류')
      }

      const date = new Date().toISOString().slice(0, 10)
      XLSX.writeFile(wb, `carbon-activities-${date}.xlsx`)
      onClose()
    } finally {
      setExporting(false)
    }
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 440, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,.7)', animation: 'slideUpFade .25s ease-out' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={15} style={{ color: 'var(--text-secondary)' }} />
            <h2 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Excel 내보내기 옵션</h2>
          </div>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>

        {/* Date range */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>날짜 범위</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', outline: 'none', colorScheme: 'dark' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>~</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              style={{ flex: 1, padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', outline: 'none', colorScheme: 'dark' }}
            />
          </div>
          <p style={{ marginTop: 6, fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>비워두면 전체 기간 내보내기</p>
        </div>

        {/* Sheet options */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: 10 }}>시트 구성</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Always included */}
            <CheckRow
              checked={true}
              disabled={true}
              label="활동 데이터"
              sub="원시 데이터 전체 (항상 포함)"
            />
            <CheckRow
              checked={includeSummary}
              onChange={setIncludeSummary}
              label="월별 요약"
              sub="월 × 카테고리 배출량 합산"
            />
            <CheckRow
              checked={includeScope}
              onChange={setIncludeScope}
              label="Scope 분류"
              sub="Scope 2 / Scope 3 비율"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 7, border: 'none', background: exporting ? 'rgba(34,211,238,.3)' : 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: '#000', cursor: exporting ? 'not-allowed' : 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { if (!exporting) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            <Download size={13} />
            {exporting ? '내보내는 중...' : '내보내기'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckRow({ checked, onChange, disabled, label, sub }: {
  checked: boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
  label: string
  sub: string
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${checked ? 'var(--border-default)' : 'var(--border-faint)'}`, background: checked ? 'var(--bg-elevated)' : 'transparent', cursor: disabled ? 'default' : 'pointer', transition: 'all .15s', opacity: disabled ? 0.5 : 1 }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange?.(e.target.checked)}
        style={{ accentColor: 'var(--color-accent)', width: 14, height: 14, cursor: disabled ? 'default' : 'pointer' }}
      />
      <div>
        <p style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-primary)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{sub}</p>
      </div>
    </label>
  )
}
