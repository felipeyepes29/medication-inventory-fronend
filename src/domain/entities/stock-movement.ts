export type MovementType = "in" | "out"

export const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "PA", label: "Pasaporte" },
  { value: "RC", label: "Registro civil" },
  { value: "PEP", label: "Permiso especial de permanencia" },
  { value: "PPT", label: "Permiso por protección temporal" },
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]["value"]

export interface StockMovement {
  id: number
  medicationId: number
  medicationName: string | null
  siteId: number | null
  siteName: string | null
  movementType: MovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  note: string | null
  documentType: string | null
  identityDocument: string | null
  firstName: string | null
  lastName: string | null
  birthCity: string | null
  birthDate: string | null
  createdAt: string | null
}

export interface StockMovementInput {
  movementType: MovementType
  quantity: number
  note?: string | null
  documentType?: string | null
  identityDocument?: string | null
  firstName?: string | null
  lastName?: string | null
  birthCity?: string | null
  birthDate?: string | null
}

export interface StockMovementFilters {
  medicationId?: number
  movementType?: MovementType
  siteId?: number
  page?: number
  pageSize?: number
}

export interface PaginatedStockMovements {
  items: StockMovement[]
  total: number
  page: number
  pageSize: number
}

export function formatBirthDate(value: string | null): string | null {
  if (!value) return null
  const [year, month, day] = value.split("-")
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

export function formatRecipient(item: StockMovement): string | null {
  const fullName = [item.firstName, item.lastName].filter(Boolean).join(" ")
  const document = [item.documentType, item.identityDocument].filter(Boolean).join(" ")
  const parts = [
    fullName || null,
    document || null,
    item.birthCity,
    formatBirthDate(item.birthDate),
  ].filter((part): part is string => Boolean(part))
  return parts.length > 0 ? parts.join(" · ") : null
}
