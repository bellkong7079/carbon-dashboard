export interface Activity {
  id: string
  date: string
  activityType: string
  description: string
  amount: number
  unit: string
  emissionFactor: number
  emission: number
  scope: string
  createdAt: string
  updatedAt: string
}

export interface EmissionFactor {
  id: string
  key: string
  name: string
  unit: string
  createdAt: string
  currentFactor?: number
}

export interface EmissionFactorVersion {
  id: string
  emissionFactorId: string
  factor: number
  source: string
  validFrom: string
  validTo: string | null
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ActivitiesResponse {
  data: Activity[]
  pagination: PaginationMeta
}

export interface CategoryStats {
  emission: number
  count: number
  percent: number
}

export interface ScopeStats {
  emission: number
  percent: number
}

export interface MonthlyData {
  month: string
  label: string
  electricity: number
  material: number
  transport: number
  total: number
}

export interface InsightData {
  topCategory: string
  topCategoryPercent: number
  message: string
  level: 'info' | 'warning' | 'critical'
  monthOverMonthChange: number | null
  latestMonth: string | null
}

export interface EmissionsResponse {
  summary: { total: number; totalCount: number }
  byCategory: Record<string, CategoryStats>
  byScope: Record<string, ScopeStats>
  byMonth: MonthlyData[]
  insights: InsightData
}

export interface UploadResult {
  inserted: number
  skipped: number
}
