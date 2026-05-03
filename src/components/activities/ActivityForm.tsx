'use client'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { activityInputSchema, type ActivityInput } from '@/lib/validations'
import {
  ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_DESCRIPTIONS, ACTIVITY_TYPE_UNITS,
  calculateEmission, DESCRIPTION_TO_FACTOR_KEY,
} from '@/lib/emissions'
import type { EmissionFactor } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

function CSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const sel = options.find(o => o.value === value)
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', transition: 'border-color .15s' }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
      >
        <span>{sel?.label ?? '선택'}</span>
        <svg width={10} height={10} viewBox="0 0 10 10" fill="none"><polyline points={open ? '2,7 5,3 8,7' : '2,3 5,7 8,3'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-overlay)', border: '1px solid var(--border-default)', borderRadius: 8, zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,.5)', overflow: 'hidden' }}>
          {options.map(o => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false) }}
              style={{ width: '100%', padding: '9px 12px', textAlign: 'left', background: value === o.value ? 'var(--bg-elevated)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 13, color: value === o.value ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'background .1s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.background = value === o.value ? 'var(--bg-elevated)' : 'transparent'; e.currentTarget.style.color = value === o.value ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >{o.label}</button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ActivityForm({ open, onClose, onSuccess }: Props) {
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [previewEmission, setPreviewEmission] = useState<number | null>(null)
  const [previewFactor, setPreviewFactor] = useState<number | null>(null)
  const [pvDisp, setPvDisp] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pvFrame = useRef<number>()
  const pvStart = useRef<number>()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ActivityInput>({
    resolver: zodResolver(activityInputSchema),
    defaultValues: { date: new Date().toISOString().slice(0, 10), activityType: 'electricity', description: '한국전력', amount: undefined },
  })

  const activityType = watch('activityType')
  const description = watch('description')
  const amount = watch('amount')

  useEffect(() => {
    fetch('/api/emission-factors')
      .then(r => r.ok ? r.json() : [])
      .then((data: unknown) => setFactors(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const descs = ACTIVITY_TYPE_DESCRIPTIONS[activityType] ?? []
    setValue('description', descs[0] ?? '')
  }, [activityType, setValue])

  useEffect(() => {
    const factorKey = DESCRIPTION_TO_FACTOR_KEY[description]
    const ef = factors.find(f => f.key === factorKey)
    if (ef?.currentFactor != null && amount > 0) {
      setPreviewFactor(ef.currentFactor)
      setPreviewEmission(calculateEmission(amount, ef.currentFactor))
    } else {
      setPreviewFactor(null)
      setPreviewEmission(null)
    }
  }, [description, amount, factors])

  useEffect(() => {
    if (previewEmission === null) { setPvDisp(0); return }
    pvStart.current = undefined
    const v = previewEmission
    const tick = (now: number) => {
      if (!pvStart.current) pvStart.current = now
      const p = Math.min((now - pvStart.current) / 600, 1)
      setPvDisp(v * (1 - Math.pow(1 - p, 3)))
      if (p < 1) pvFrame.current = requestAnimationFrame(tick)
    }
    pvFrame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(pvFrame.current!)
  }, [previewEmission])

  const onSubmit = async (data: ActivityInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? '등록에 실패했습니다'); return }
      toast.success('데이터가 추가되었습니다')
      reset()
      onSuccess()
      onClose()
    } catch { toast.error('서버 오류가 발생했습니다') }
    finally { setIsSubmitting(false) }
  }

  const unit = ACTIVITY_TYPE_UNITS[activityType] ?? ''
  const IS: React.CSSProperties = { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-primary)', outline: 'none', transition: 'border-color .15s' }
  const LS: React.CSSProperties = { display: 'block', fontSize: 12, fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(2px)', zIndex: 40, opacity: open ? 1 : 0, transition: 'opacity .25s', pointerEvents: open ? 'auto' : 'none' }} />
      {/* Panel */}
      <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, zIndex: 50, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 48px rgba(0,0,0,.5)', transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>새 활동 데이터 추가</h2>
          <button onClick={onClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)' }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Preview */}
        {previewEmission !== null && (
          <div style={{ margin: '20px 24px 0', borderRadius: 8, background: 'var(--color-accent-bg)', border: '1px solid rgba(34,211,238,.2)', padding: 16 }}>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(34,211,238,.6)', marginBottom: 4 }}>예상 배출량</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 26, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--color-accent)', letterSpacing: '-0.02em' }}>
                {pvDisp.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'rgba(34,211,238,.7)' }}>kgCO₂e</span>
            </div>
            <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginTop: 4 }}>
              {previewFactor} kgCO₂e/{unit} × {amount} {unit}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={LS}>날짜</label>
            <input type="date" style={{ ...IS, ...(errors.date ? { borderColor: 'var(--color-danger)' } : {}) }} {...register('date')} onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={e => (e.target.style.borderColor = errors.date ? 'var(--color-danger)' : 'var(--border-subtle)')} />
            {errors.date && <p style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 4, fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>{errors.date.message}</p>}
          </div>
          <div>
            <label style={LS}>활동 유형</label>
            <CSelect value={activityType} onChange={v => setValue('activityType', v as ActivityInput['activityType'])} options={Object.entries(ACTIVITY_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
          </div>
          <div>
            <label style={LS}>설명</label>
            <CSelect value={description} onChange={v => setValue('description', v)} options={(ACTIVITY_TYPE_DESCRIPTIONS[activityType] ?? []).map(d => ({ value: d, label: d }))} />
          </div>
          <div>
            <label style={LS}>사용량 ({unit})</label>
            <div style={{ position: 'relative' }}>
              <input type="number" step="any" min="0" placeholder="예: 1100" style={{ ...IS, paddingRight: 52, ...(errors.amount ? { borderColor: 'var(--color-danger)' } : {}) }} {...register('amount', { valueAsNumber: true })} onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')} onBlur={e => (e.target.style.borderColor = errors.amount ? 'var(--color-danger)' : 'var(--border-subtle)')} />
              <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>{unit}</span>
            </div>
            {errors.amount && <p style={{ fontSize: 11, color: 'var(--color-danger)', marginTop: 4, fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>{errors.amount.message}</p>}
          </div>
        </form>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-elevated)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>취소</button>
          <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: isSubmitting ? 'rgba(34,211,238,.4)' : 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: '#000', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'all .15s' }} onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.1)' }} onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>{isSubmitting ? '추가 중...' : '데이터 추가'}</button>
        </div>
      </div>
    </>
  )
}
