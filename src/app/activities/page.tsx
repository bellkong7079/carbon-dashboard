'use client'
import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import ActivityTable from '@/components/activities/ActivityTable'
import ActivityForm from '@/components/activities/ActivityForm'
import ExcelUploader from '@/components/activities/ExcelUploader'
import ExportModal from '@/components/activities/ExportModal'
import FactorManager from '@/components/settings/FactorManager'
import type { ActivitiesResponse } from '@/types'

function CSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const sel = options.find(o => o.value === value)
  return (
    <div style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', width: 140 }}>
        <span>{sel?.label ?? '선택'}</span>
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><polyline points={open ? '2,7 5,3 8,7' : '2,3 5,7 8,3'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div onMouseLeave={() => setOpen(false)} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 6, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,.5)', overflow: 'hidden' }}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }}
              style={{ width: '100%', padding: '8px 12px', textAlign: 'left', background: value === o.value ? 'var(--bg-elevated)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: value === o.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = value === o.value ? 'var(--bg-elevated)' : 'transparent'; e.currentTarget.style.color = value === o.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >{o.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ActivitiesPage() {
  const [data, setData] = useState<ActivitiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [managerOpen, setManagerOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', sortBy, order })
      if (typeFilter !== 'all') params.set('type', typeFilter)
      const res = await fetch(`/api/activities?${params}`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, sortBy, order])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        title="활동 데이터"
        description="전기·원소재·운송 배출 활동 데이터 입력 및 조회"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setManagerOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.22 3.22l1.41 1.41M9.37 9.37l1.41 1.41M3.22 10.78l1.41-1.41M9.37 4.63l1.41-1.41" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              유형 관리
            </button>
            <button onClick={() => setExportOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none"><line x1="7" y1="5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="4,10 7,13 10,10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4V2a1 1 0 011-1h8a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Excel 내보내기
            </button>
            <button onClick={() => setUploaderOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none"><line x1="7" y1="1" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><polyline points="4,4 7,1 10,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Excel 업로드
            </button>
            <button onClick={() => setFormOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: '#000', cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
              <svg width={13} height={13} viewBox="0 0 14 14" fill="none"><line x1="7" y1="1" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              데이터 추가
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}>
          <CSelect
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1) }}
            options={[{ value: 'all', label: '전체 유형' }, { value: 'electricity', label: '전기' }, { value: 'material', label: '원소재' }, { value: 'transport', label: '운송' }]}
          />
          <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
            검색 결과: <span style={{ color: 'var(--text-secondary)' }}>{data?.pagination.total ?? 0}건</span>
          </span>
        </div>

        {loading && (
          <div style={{ borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)' }}>로딩 중...</p>
          </div>
        )}

        {!loading && data && (
          <ActivityTable
            activities={data.data}
            pagination={data.pagination}
            onPageChange={setPage}
            onSortChange={(s, o) => { setSortBy(s); setOrder(o); setPage(1) }}
            sortBy={sortBy}
            order={order}
            onRefresh={fetchData}
          />
        )}
      </div>

      <ActivityForm open={formOpen} onClose={() => setFormOpen(false)} onSuccess={fetchData} />
      <ExcelUploader open={uploaderOpen} onClose={() => setUploaderOpen(false)} onSuccess={fetchData} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <FactorManager open={managerOpen} onClose={() => setManagerOpen(false)} />
    </div>
  )
}
