import { z } from 'zod'

export const activityInputSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식은 YYYY-MM-DD여야 합니다')
    .refine((d) => new Date(d) <= new Date(), { message: '미래 날짜는 입력할 수 없습니다' }),
  activityType: z.string().min(1, '활동 유형을 선택하세요'),
  description: z.string().min(1, '설명을 선택하세요'),
  amount: z
    .number({ error: '숫자를 입력하세요' })
    .positive('0보다 큰 값을 입력하세요')
    .max(1_000_000, '입력값이 너무 큽니다'),
})

export type ActivityInput = z.infer<typeof activityInputSchema>
