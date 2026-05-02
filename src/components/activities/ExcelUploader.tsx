'use client'
import { useCallback, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Upload, Download, CheckCircle, AlertCircle } from 'lucide-react'
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
    reader.onload = (e) => {
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

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    parsePreview(f)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? '업로드 실패')
        return
      }
      const data = await res.json()
      setResult(data)
      toast.success(`${data.inserted}건 추가 완료`)
      onSuccess()
    } catch {
      toast.error('업로드 중 오류가 발생했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setHeaders([])
    setResult(null)
    onClose()
  }

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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Upload size={18} className="text-emerald-400" />
            Excel 파일 업로드
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 드래그앤드롭 영역 */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-700 hover:border-gray-600'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <Upload size={32} className="mx-auto text-gray-500 mb-2" />
            {file ? (
              <p className="text-sm text-emerald-400 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-400">파일을 드래그하거나 클릭하여 선택하세요</p>
                <p className="text-xs text-gray-600 mt-1">.xlsx, .xls 파일만 가능</p>
              </>
            )}
          </div>

          {/* 컬럼 안내 */}
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-400">
            <p className="font-medium text-gray-300 mb-1">필수 컬럼</p>
            <p>일자(원본) · 활동 유형 (전기/원소재/운송) · 설명 · 량 · 단위</p>
          </div>

          {/* 미리보기 */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">상위 5행 미리보기</p>
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="bg-gray-800">
                      {headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        {headers.map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-300">{String(row[h] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 결과 */}
          {result && (
            <div className="flex gap-4 p-3 rounded-lg bg-gray-800 text-sm">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={16} />
                <span>{result.inserted}건 추가</span>
              </div>
              {result.skipped > 0 && (
                <div className="flex items-center gap-2 text-orange-400">
                  <AlertCircle size={16} />
                  <span>{result.skipped}건 중복 건너뜀</span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 gap-1.5"
              onClick={downloadSample}
            >
              <Download size={14} />
              샘플 다운로드
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
              onClick={handleClose}
            >
              닫기
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={!file || isUploading || !!result}
              onClick={handleUpload}
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
