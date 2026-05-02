'use client'
import { useCallback, useEffect, useState } from 'react'
import Header from '@/components/layout/Header'
import ActivityTable from '@/components/activities/ActivityTable'
import ActivityForm from '@/components/activities/ActivityForm'
import ExcelUploader from '@/components/activities/ExcelUploader'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Upload } from 'lucide-react'
import type { ActivitiesResponse } from '@/types'

export default function ActivitiesPage() {
  const [data, setData] = useState<ActivitiesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState('date')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        sortBy,
        order,
      })
      if (typeFilter !== 'all') params.set('type', typeFilter)
      const res = await fetch(`/api/activities?${params}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, sortBy, order])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSortChange = (newSortBy: string, newOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setOrder(newOrder)
    setPage(1)
  }

  const handleFilterChange = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <Header
        title="활동 데이터 관리"
        description="전기·원소재·운송 배출 활동 데이터 입력 및 조회"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 gap-1.5"
              onClick={() => setUploaderOpen(true)}
            >
              <Upload size={14} />
              Excel 업로드
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={() => setFormOpen(true)}
            >
              <Plus size={14} />
              데이터 추가
            </Button>
          </div>
        }
      />

      {/* 필터 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">유형 필터:</span>
        <Select value={typeFilter} onValueChange={(v) => { if (v) handleFilterChange(v) }}>
          <SelectTrigger className="w-36 h-8 bg-gray-900 border-gray-700 text-white text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all" className="text-white text-sm">전체</SelectItem>
            <SelectItem value="electricity" className="text-white text-sm">전기</SelectItem>
            <SelectItem value="material" className="text-white text-sm">원소재</SelectItem>
            <SelectItem value="transport" className="text-white text-sm">운송</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-500 text-sm">로딩 중...</p>
        </div>
      )}

      {!loading && data && (
        <ActivityTable
          activities={data.data}
          pagination={data.pagination}
          onPageChange={setPage}
          onSortChange={handleSortChange}
          sortBy={sortBy}
          order={order}
          onRefresh={fetchData}
        />
      )}

      <ActivityForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchData}
      />

      <ExcelUploader
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  )
}
