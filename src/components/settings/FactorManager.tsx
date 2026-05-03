'use client'
import { useEffect, useState } from 'react'
import { X, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { ActivityType, EmissionFactor } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function FactorManager({ open, onClose }: Props) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [loading, setLoading] = useState(false)

  // New ActivityType form state
  const [newLabel, setNewLabel] = useState('')
  const [newUnit, setNewUnit] = useState('')
  const [newScope, setNewScope] = useState<'scope2' | 'scope3'>('scope3')
  const [addingType, setAddingType] = useState(false)

  // New EmissionFactor form state
  const [fActType, setFActType] = useState('')
  const [fName, setFName] = useState('')
  const [fUnit, setFUnit] = useState('')
  const [fFactor, setFFactor] = useState('')
  const [fSource, setFSource] = useState('')
  const [addingFactor, setAddingFactor] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const [t, f] = await Promise.all([
        fetch('/api/activity-types').then(r => r.ok ? r.json() : []),
        fetch('/api/emission-factors').then(r => r.ok ? r.json() : []),
      ])
      setActivityTypes(Array.isArray(t) ? t : [])
      const fArr = Array.isArray(f) ? (f as EmissionFactor[]) : []
      setFactors(fArr)
      if (fArr.length > 0 && !fActType) setFActType(fArr[0].activityType)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (open) refresh() }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const deleteType = async (id: string, label: string) => {
    if (!confirm(`"${label}" 활동 유형을 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/activity-types/${id}`, { method: 'DELETE' })
    const body = await res.json()
    if (!res.ok) { toast.error(body.error ?? '삭제에 실패했습니다'); return }
    toast.success(`"${label}" 삭제 완료`)
    refresh()
  }

  const deleteFactor = async (id: string, name: string) => {
    if (!confirm(`"${name}" 배출계수를 삭제하시겠습니까?`)) return
    const res = await fetch(`/api/emission-factors/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('삭제에 실패했습니다'); return }
    toast.success(`"${name}" 삭제 완료`)
    refresh()
  }

  const submitType = async () => {
    if (!newLabel.trim() || !newUnit.trim()) { toast.error('이름과 단위를 입력하세요'); return }
    setAddingType(true)
    try {
      const res = await fetch('/api/activity-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel.trim(), unit: newUnit.trim(), scope: newScope }),
      })
      const body = await res.json()
      if (!res.ok) { toast.error(body.error ?? '등록에 실패했습니다'); return }
      toast.success(`"${newLabel}" 등록 완료`)
      setNewLabel(''); setNewUnit(''); setNewScope('scope3')
      refresh()
    } finally { setAddingType(false) }
  }

  const submitFactor = async () => {
    if (!fActType || !fName.trim() || !fUnit.trim() || !fFactor || !fSource.trim()) {
      toast.error('모든 필드를 입력하세요')
      return
    }
    const factorNum = parseFloat(fFactor)
    if (isNaN(factorNum) || factorNum <= 0) { toast.error('배출계수는 0보다 큰 숫자여야 합니다'); return }
    setAddingFactor(true)
    try {
      const res = await fetch('/api/emission-factors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityType: fActType, name: fName.trim(), unit: fUnit.trim(), factor: factorNum, source: fSource.trim() }),
      })
      const body = await res.json()
      if (!res.ok) { toast.error(body.error ?? '등록에 실패했습니다'); return }
      toast.success(`"${fName}" 배출계수 등록 완료`)
      setFName(''); setFUnit(''); setFFactor(''); setFSource('')
      refresh()
    } finally { setAddingFactor(false) }
  }

  const IS: React.CSSProperties = { flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 7, padding: '8px 10px', fontSize: 12, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)', outline: 'none', minWidth: 0 }
  const HL: React.CSSProperties = { fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-muted)', marginBottom: 10 }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(2px)', zIndex: 40, opacity: open ? 1 : 0, transition: 'opacity .25s', pointerEvents: open ? 'auto' : 'none' }} />
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 480, zIndex: 50, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(0,0,0,.5)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>유형 및 배출계수 관리</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* ── 활동 유형 ── */}
          <section>
            <p style={HL}>활동 유형</p>
            {loading ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>로딩 중...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {activityTypes.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-primary)' }}>{t.label}</span>
                      <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{t.unit} · {t.scope === 'scope2' ? 'Scope 2' : 'Scope 3'}</span>
                    </div>
                    <button onClick={() => deleteType(t.id, t.label)} style={{ padding: 5, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'rgba(239,68,68,.1)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add activity type form */}
            <div style={{ padding: 14, borderRadius: 8, border: '1px dashed var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={11} /> 새 활동 유형 추가
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="이름 (예: 열에너지)" style={IS} />
                  <input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="단위 (예: GJ)" style={{ ...IS, flex: '0 0 100px' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {(['scope2', 'scope3'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setNewScope(s)}
                      style={{ flex: 1, padding: '6px 0', borderRadius: 7, border: `1px solid ${newScope === s ? 'var(--color-accent)' : 'var(--border-subtle)'}`, background: newScope === s ? 'var(--color-accent-bg)' : 'transparent', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: newScope === s ? 'var(--color-accent)' : 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s' }}>
                      {s === 'scope2' ? 'Scope 2' : 'Scope 3'}
                    </button>
                  ))}
                  <button onClick={submitType} disabled={addingType}
                    style={{ flex: '0 0 64px', padding: '6px 0', borderRadius: 7, border: 'none', background: 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 12, color: '#000', cursor: addingType ? 'not-allowed' : 'pointer', opacity: addingType ? 0.6 : 1 }}>
                    {addingType ? '...' : '추가'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── 배출계수 ── */}
          <section>
            <p style={HL}>배출계수 (설명)</p>

            {!loading && activityTypes.map(t => {
              const typeFactors = factors.filter(f => f.activityType === t.key)
              if (typeFactors.length === 0) return null
              return (
                <div key={t.key} style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{t.label}</p>
                  {typeFactors.map(f => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', marginBottom: 4 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)' }}>{f.name}</span>
                        {f.currentFactor != null && (
                          <span style={{ marginLeft: 8, fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>
                            {f.currentFactor} {f.unit}
                          </span>
                        )}
                      </div>
                      <button onClick={() => deleteFactor(f.id, f.name)} style={{ padding: 5, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'rgba(239,68,68,.1)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Add emission factor form */}
            <div style={{ padding: 14, borderRadius: 8, border: '1px dashed var(--border-subtle)', background: 'var(--bg-elevated)' }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-syne), Syne, sans-serif', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={11} /> 새 배출계수 추가
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select value={fActType} onChange={e => setFActType(e.target.value)}
                  style={{ ...IS, flex: 'unset', width: '100%', cursor: 'pointer' }}>
                  {activityTypes.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={fName} onChange={e => setFName(e.target.value)} placeholder="이름 (예: 서울에너지)" style={IS} />
                  <input value={fUnit} onChange={e => setFUnit(e.target.value)} placeholder="단위 (예: kgCO₂e/kWh)" style={{ ...IS, flex: '0 0 150px' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={fFactor} onChange={e => setFFactor(e.target.value)} type="number" step="any" placeholder="배출계수 (예: 0.456)" style={IS} />
                  <input value={fSource} onChange={e => setFSource(e.target.value)} placeholder="출처 (예: 환경부 2024)" style={IS} />
                </div>
                <button onClick={submitFactor} disabled={addingFactor}
                  style={{ padding: '7px 0', borderRadius: 7, border: 'none', background: 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 12, color: '#000', cursor: addingFactor ? 'not-allowed' : 'pointer', opacity: addingFactor ? 0.6 : 1 }}>
                  {addingFactor ? '등록 중...' : '배출계수 추가'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
