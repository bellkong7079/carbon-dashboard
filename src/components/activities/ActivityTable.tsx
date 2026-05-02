'use client'
import { useState, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { formatEmission, formatDate, formatNumber } from '@/lib/format'
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

const TYPE_COLORS: Record<string, string> = {
  electricity: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  material: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  transport: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

const DOT_COLORS: Record<string, string> = {
  electricity: 'bg-blue-400',
  material: 'bg-purple-400',
  transport: 'bg-emerald-400',
}

export default function ActivityTable({
  activities, pagination, onPageChange, onSortChange, sortBy, order, onRefresh,
}: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('삭제되었습니다')
      onRefresh()
    } catch {
      toast.error('삭제에 실패했습니다')
    } finally {
      setDeletingId(null)
    }
  }, [onRefresh])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, order === 'asc' ? 'desc' : 'asc')
    } else {
      onSortChange(field, 'desc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return <ChevronDown size={12} className="text-gray-600" />
    return order === 'asc' ? <ChevronUp size={12} className="text-emerald-400" /> : <ChevronDown size={12} className="text-emerald-400" />
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead
                className="text-gray-400 text-xs cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('date')}
              >
                <span className="flex items-center gap-1">날짜 <SortIcon field="date" /></span>
              </TableHead>
              <TableHead className="text-gray-400 text-xs">유형</TableHead>
              <TableHead className="text-gray-400 text-xs">설명</TableHead>
              <TableHead className="text-gray-400 text-xs text-right">사용량</TableHead>
              <TableHead className="text-gray-400 text-xs">단위</TableHead>
              <TableHead className="text-gray-400 text-xs text-right">배출계수</TableHead>
              <TableHead
                className="text-gray-400 text-xs text-right cursor-pointer hover:text-white select-none"
                onClick={() => handleSort('emission')}
              >
                <span className="flex items-center justify-end gap-1">배출량 <SortIcon field="emission" /></span>
              </TableHead>
              <TableHead className="text-gray-400 text-xs">Scope</TableHead>
              <TableHead className="text-gray-400 text-xs w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 && (
              <TableRow className="border-gray-800">
                <TableCell colSpan={9} className="text-center text-gray-500 py-12 text-sm">
                  데이터가 없습니다
                </TableCell>
              </TableRow>
            )}
            {activities.map((activity) => (
              <TableRow
                key={activity.id}
                className="border-gray-800 hover:bg-gray-800/50 transition-colors"
                onMouseEnter={() => setHoveredId(activity.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <TableCell className="text-gray-300 text-sm">{formatDate(activity.date)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border ${TYPE_COLORS[activity.activityType] ?? ''}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[activity.activityType] ?? 'bg-gray-400'}`} />
                    {ACTIVITY_TYPE_LABELS[activity.activityType] ?? activity.activityType}
                  </span>
                </TableCell>
                <TableCell className="text-gray-300 text-sm">{activity.description}</TableCell>
                <TableCell className="text-gray-300 text-sm text-right">{formatNumber(activity.amount)}</TableCell>
                <TableCell className="text-gray-400 text-sm">{activity.unit}</TableCell>
                <TableCell className="text-gray-400 text-sm text-right">{activity.emissionFactor}</TableCell>
                <TableCell className="text-emerald-400 text-sm font-medium text-right">{formatEmission(activity.emission)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">
                    {activity.scope}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-opacity ${hoveredId === activity.id ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => handleDelete(activity.id)}
                    disabled={deletingId === activity.id}
                  >
                    <Trash2 size={13} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          총 {pagination.total}건 · {pagination.page}/{pagination.totalPages} 페이지
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  )
}
