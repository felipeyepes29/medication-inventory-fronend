export type ExpirationStatus = "all" | "expiring_soon" | "expired" | "no_date"

export interface Medication {
  id: number
  position: number
  name: string
  quantity: number
  concentration: string
  brand: string
  expirationDate: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface MedicationFilters {
  q?: string
  brand?: string
  expirationStatus?: ExpirationStatus
  page?: number
  pageSize?: number
}

export interface PaginatedMedications {
  items: Medication[]
  total: number
  page: number
  pageSize: number
}

export interface MedicationInput {
  position: number
  name: string
  quantity: number
  concentration: string
  brand: string
  expirationDate: string | null
}
