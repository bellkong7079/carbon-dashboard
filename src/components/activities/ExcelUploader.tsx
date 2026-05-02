'use client'
import { useRef, useState } from 'react'
import { X, Upload, Download, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PreviewRow {
  [key: string]: string | number
}

export default function ExcelUploader({ open, onClose, onSuccess }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [result, setResult] = useState<{ inserted: number; skipped: number } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const parsePreview = (f: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = e.target?.result
      if (!data) return
      const wb = XLSX.read(data, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<PreviewRow>(ws)
      setHeaders(rows.length > 0 ? Object.keys(rows[0]) : [])
      setPreview(rows.slice(0, 5))
    }
    reader.readAsArrayBuffer(f)
  }

  const handleFile = (f: File) => { setFile(f); setResult(null); parsePreview(f) }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { const err = await res.json(); toast.error(err.error ?? '업로드 실패'); return }
      const data = await res.json()
      setResult(data)
      toast.success(`${data.inserted}건 추가 완료`)
      onSuccess()
    } catch { toast.error('업로드 중 오류가 발생했습니다') }
    finally { setIsUploading(false) }
  }

  const handleClose = () => { setFile(null); setPreview([]); setHeaders([]); setResult(null); onClose() }

  const downloadSample = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['일자(원본)', '활동 유형', '설명', '량', '단위'],
      ['2025-09-01', '전기', '한국전력', 110, 'kWh'],
      ['2025-09-01', '원소재', '플라스틱 1', 230, 'kg'],
      ['2025-09-01', '운송', '트럭', 41, 'ton-km'],
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'activities')
    XLSX.writeFile(wb, 'sample-template.xlsx')
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(3px)' }} />
      <div style={{ position: 'relative', zIndex: 1, width: 560, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,.7)', animation: 'slideUpFade .25s ease-out' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} style={{ color: 'var(--text-secondary)' }} />
            <h2 style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Excel 파일 업로드</h2>
          </div>
          <button onClick={handleClose} style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
            <X size={14} />
          </button>
        </div>

        {/* Result state */}
        {result ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,211,153,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} style={{ color: 'var(--color-success)' }} />
            </div>
            <p style={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', marginBottom: 12 }}>업로드 완료</p>
            <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 13, color: 'var(--color-success)' }}>{result.inserted}건 추가됨</p>
            {result.skipped > 0 && <p style={{ fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{result.skipped}건 중복 건너뜀</p>}
          </div>
        ) : (
          <>
            {/* Drop zone */}
            <div
              style={{ borderRadius: 10, border: `2px dashed ${isDragging ? 'var(--color-accent)' : 'var(--border-default)'}`, padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: isDragging ? 'var(--color-accent-bg)' : 'transparent', cursor: 'pointer', transition: 'all .15s', marginBottom: 16 }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <div style={{ padding: 12, borderRadius: '50%', background: 'var(--bg-elevated)', color: isDragging ? 'var(--color-accent)' : 'var(--text-muted)' }}>
                <svg width={32} height={32} viewBox="0 0 32 32" fill="none">
                  <path d="M10 22a7 7 0 112.5-13.5A8 8 0 1122 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="22" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <polyline points="12,25 16,22 20,25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {file
                ? <p style={{ fontSize: 13, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--color-accent)' }}>{file.name}</p>
                : <>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>.xlsx 파일을 드래그하거나<br />클릭하여 업로드</p>
                  <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)' }}>지원 형식: .xlsx, .xls</p>
                </>}
            </div>

            {/* Column guide */}
            <div style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: 12, marginBottom: preview.length > 0 ? 16 : 0 }}>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginBottom: 4 }}>필수 컬럼:</p>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-secondary)' }}>일자(원본) · 활동 유형 (전기/원소재/운송) · 설명 · 량 · 단위</p>
            </div>

            {/* Preview */}
            {preview.length > 0 && (
              <div style={{ marginBottom: 0 }}>
                <p style={{ fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace', color: 'var(--text-muted)', marginBottom: 8 }}>상위 5행 미리보기</p>
                <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-dm-mono), DM Mono, monospace' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-elevated)' }}>
                        {headers.map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 400 }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-faint)' }}>
                          {headers.map(h => <td key={h} style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{String(row[h] ?? '')}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20 }}>
          {!result && (
            <button onClick={downloadSample} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-dm-mono), DM Mono, monospace', fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all .15s' }}>
              <Download size={13} /> 샘플 다운로드
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button onClick={handleClose} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border-subtle)', background: 'transparent', fontFamily: 'var(--font-syne), Syne, sans-serif', fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>
            {result ? '닫기' : '취소'}
          </button>
          {!result && (
            <button onClick={handleUpload} disabled={!file || isUploading} style={{ padding: '7px 16px', borderRadius: 7, border: 'none', background: !file || isUploading ? 'rgba(34,211,238,.3)' : 'var(--color-accent)', fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 500, fontSize: 13, color: '#000', cursor: !file || isUploading ? 'not-allowed' : 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { if (file && !isUploading) e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
              {isUploading ? '업로드 중...' : '업로드'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
