'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/format'
import { ACTIVITY_TYPE_LABELS } from '@/lib/emissions'
import { toast } from 'sonner'
import type { Activity } from '@/types'

interface Props {
  activities: Activity[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void
  sortBy: string
  order: 'asc' | 'desc'
  onRefresh: () => void
}

const BADGE: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  electricity: { dot: '#38bdf8', text: '#38bdf8', bg: 'rgba(56,189,248,.08)', border: 'rgba(56,189,248,.2)' },
  material:    { dot: '#fb923c', text: '#fb923c', bg: 'rgba(251,146,60,.08)',  border: 'rgba(251,146,60,.2)' },
  transport:   { dot: '#4ade80', text: '#4ade80', bg: 'rgba(74,222,128,.08)',  border: 'rgba(74,222,128,.2)' },
}

function ActivityBadge({ type }: { type: string }) {
  const s = BADGE[type] ?? { dot: '#9494a0', text: '#9494a0', bg: 'transparent', border: 'var(--border-subtle)' }
  const label = ACTIVITY_TYPE_LABELS[type] ?? type
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 7px', borderRadius: 4, border: `1px solid ${s.border}`, background: s.bg, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: s.text }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  )
}

function ScopeBadge({ scope }: { scope: string }) {
  const is2 = scope === 'scope2'
  return (
    <span style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', padding: '2px 6px', borderRadius: 3, background: is2 ? 'rgba(56,189,248,.08)' : 'rgba(251,146,60,.08)', color: is2 ? '#38bdf8' : '#fb923c', border: `1px solid ${is2 ? 'rgba(56,189,248,.2)' : 'rgba(251,146,60,.2)'}` }}>
      {is2 ? 'S2' : 'S3'}
    </span>
  )
}

function SortIcon({ field, sortBy, order }: { field: string; sortBy: string; order: string }) {
  const active = sortBy === field
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 1 }}>
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none" style={{ opacity: active && order === 'asc' ? 1 : 0.3 }}>
        <polyline points="2,7 5,3 8,7" stroke={active && order === 'asc' ? 'var(--color-accent)' : 'currentColor'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg width={10} height={10} viewBox="0 0 10 10" fill="none" style={{ opacity: active && order === 'desc' ? 1 : 0.3 }}>
        <polyline points="2,3 5,7 8,3" stroke={active && order === 'desc' ? 'var(--color-accent)' : 'currentColor'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function ActivityRow({ activity, onRefresh }: { activity: Activity; onRefresh: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('데이터가 삭제되었습니다')
      onRefresh()
    } catch {
      toast.error('삭제에 실패했습니다')
    } finally {
      setDeleting(false)
    }
  }

  const td: React.CSSProperties = { padding: '10px 16px', borderBottom: '1px solid var(--border-faint)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }

  return (
    <tr
      style={{ transition: 'background .1s' }}
      onMouseEnter={e => { setHovered(true); (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)' }}
      onMouseLeave={e => { setHovered(false); (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <td style={td}>{formatDate(activity.date)}</td>
      <td style={td}><ActivityBadge type={activity.activityType} /></td>
      <td style={{ ...td, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.description}</td>
      <td style={{ ...td, textAlign: 'right' }}>{formatNumber(activity.amount)}</td>
      <td style={td}>{activity.unit}</td>
      <td style={{ ...td, textAlign: 'right' }}>{activity.emissionFactor}</td>
      <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 500 }}>
        {activity.emission.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kgCO₂e
      </td>
      <td style={td}><ScopeBadge scope={activity.scope} /></td>
      <td style={{ ...td, textAlign: 'center' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{ padding: 6, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--color-danger)', cursor: 'pointer', opacity: hovered ? 1 : 0, transition: 'opacity .1s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

export default function ActivityTable({ activities, pagination, onPageChange, onSortChange, sortBy, order, onRefresh }: Props) {
  const handleSort = (field: string) => {
    if (sortBy === field) onSortChange(field, order === 'asc' ? 'desc' : 'asc')
    else onSortChange(field, 'desc')
  }

  const thStyle: React.CSSProperties = { padding: '10px 16px', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 400, userSelect: 'none', whiteSpace: 'nowrap' }

  const SortTh = ({ label, field }: { label: string; field: string }) => (
    <th onClick={() => handleSort(field)} style={{ ...thStyle, cursor: 'pointer', color: sortBy === field ? 'var(--color-accent)' : 'var(--text-muted)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {label}
        <SortIcon field={field} sortBy={sortBy} order={order} />
      </span>
    </th>
  )

  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <SortTh label="날짜" field="date" />
              <th style={thStyle}>유형</th>
              <th style={thStyle}>설명</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>사용량</th>
              <th style={thStyle}>단위</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>배출계수</th>
              <SortTh label="배출량" field="emission" />
              <th style={thStyle}>Scope</th>
              <th style={{ width: 44 }} />
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '48px 0', textAlign: 'center', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                  데이터가 없습니다
                </td>
              </tr>
            )}
            {activities.map(activity => (
              <ActivityRow key={activity.id} activity={activity} onRefresh={onRefresh} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
          {pagination.total}개 중 {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
            style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: pagination.page <= 1 ? 'var(--text-disabled)' : 'var(--text-secondary)', cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer' }}
          >이전</button>
          {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
            const pg = i + 1
            const active = pg === pagination.page
            return (
              <button key={pg} onClick={() => onPageChange(pg)}
                style={{ padding: '5px 10px', borderRadius: 5, border: 'none', background: active ? 'var(--color-accent)' : 'transparent', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: active ? '#000' : 'var(--text-secondary)', cursor: 'pointer', minWidth: 30 }}
              >{pg}</button>
            )
          })}
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
            style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: pagination.page >= pagination.totalPages ? 'var(--text-disabled)' : 'var(--text-secondary)', cursor: pagination.page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}
          >다음</button>
        </div>
      </div>
    </div>
  )
}
