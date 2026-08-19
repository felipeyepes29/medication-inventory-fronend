export type ExpirationStatus = "all" | "expiring_soon" | "expired" | "no_date"
export type SortField = "position" | "box" | "quantity"
export type SortOrder = "asc" | "desc"

export interface Medication {
  id: number
  siteId: number
  siteName: string | null
  siteAddress: string | null
  position: number
  name: string
  quantity: number
  concentration: string
  brand: string
  box: string | null
  expirationDate: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface MedicationFilters {
  q?: string
  brand?: string
  box?: string
  siteId?: number
  expirationStatus?: ExpirationStatus
  sortBy?: SortField
  sortOrder?: SortOrder
  page?: number
  pageSize?: number
  skipAuth?: boolean
}

export interface PaginatedMedications {
  items: Medication[]
  total: number
  page: number
  pageSize: number
}

export interface MedicationInput {
  position?: number | null
  siteId?: number | null
  name: string
  quantity: number
  concentration: string
  brand: string
  box: string | null
  expirationDate: string | null
}
