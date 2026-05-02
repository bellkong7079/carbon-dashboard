'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { activityInputSchema, type ActivityInput } from '@/lib/validations'
import {
  ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_DESCRIPTIONS, ACTIVITY_TYPE_UNITS,
  calculateEmission, DESCRIPTION_TO_FACTOR_KEY,
} from '@/lib/emissions'
import { formatEmission } from '@/lib/format'
import type { EmissionFactor } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function ActivityForm({ open, onClose, onSuccess }: Props) {
  const [factors, setFactors] = useState<EmissionFactor[]>([])
  const [previewEmission, setPreviewEmission] = useState<number | null>(null)
  const [previewFactor, setPreviewFactor] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ActivityInput>({
    resolver: zodResolver(activityInputSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      activityType: 'electricity',
      description: '한국전력',
      amount: undefined,
    },
  })

  const activityType = watch('activityType')
  const description = watch('description')
  const amount = watch('amount')

  useEffect(() => {
    fetch('/api/emission-factors')
      .then((r) => r.json())
      .then((data: EmissionFactor[]) => setFactors(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    const descs = ACTIVITY_TYPE_DESCRIPTIONS[activityType] ?? []
    setValue('description', descs[0] ?? '')
  }, [activityType, setValue])

  useEffect(() => {
    const factorKey = DESCRIPTION_TO_FACTOR_KEY[description]
    const ef = factors.find((f) => f.key === factorKey)
    if (ef?.currentFactor != null && amount > 0) {
      setPreviewFactor(ef.currentFactor)
      setPreviewEmission(calculateEmission(amount, ef.currentFactor))
    } else {
      setPreviewFactor(null)
      setPreviewEmission(null)
    }
  }, [description, amount, factors])

  const onSubmit = async (data: ActivityInput) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? '등록에 실패했습니다')
        return
      }
      toast.success('활동 데이터가 등록되었습니다')
      reset()
      onSuccess()
      onClose()
    } catch {
      toast.error('서버 오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const unit = ACTIVITY_TYPE_UNITS[activityType] ?? ''

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent className="bg-gray-900 border-gray-800 text-white w-full sm:max-w-md">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-white">활동 데이터 등록</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* 날짜 */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">날짜</Label>
            <Input
              type="date"
              className="bg-gray-800 border-gray-700 text-white"
              {...register('date')}
            />
            {errors.date && <p className="text-xs text-red-400">{errors.date.message}</p>}
          </div>

          {/* 활동 유형 */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">활동 유형</Label>
            <Select
              value={activityType}
              onValueChange={(v) => { if (v) setValue('activityType', v as ActivityInput['activityType']) }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-white hover:bg-gray-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activityType && <p className="text-xs text-red-400">{errors.activityType.message}</p>}
          </div>

          {/* 설명 */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">설명</Label>
            <Select
              value={description}
              onValueChange={(v) => { if (v) setValue('description', v) }}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {(ACTIVITY_TYPE_DESCRIPTIONS[activityType] ?? []).map((d) => (
                  <SelectItem key={d} value={d} className="text-white hover:bg-gray-700">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
          </div>

          {/* 사용량 */}
          <div className="space-y-1.5">
            <Label className="text-gray-300 text-sm">사용량 ({unit})</Label>
            <div className="relative">
              <Input
                type="number"
                step="any"
                min="0"
                placeholder={`예: 110`}
                className="bg-gray-800 border-gray-700 text-white pr-16"
                {...register('amount', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{unit}</span>
            </div>
            {errors.amount && <p className="text-xs text-red-400">{errors.amount.message}</p>}
          </div>

          {/* 실시간 배출량 미리보기 */}
          {previewEmission !== null && previewFactor !== null && (
            <div className="rounded-lg bg-gray-800/60 border border-gray-700 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">배출량 계산 미리보기</p>
              <p className="text-xs text-gray-300">
                <span className="text-blue-400">{previewFactor} kgCO₂e/{unit}</span>
                {' × '}
                <span className="text-white">{amount} {unit}</span>
                {' = '}
                <span className="text-emerald-400 font-semibold">{formatEmission(previewEmission)}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
