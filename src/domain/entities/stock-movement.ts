export type MovementType = "in" | "out"

export interface StockMovement {
  id: number
  medicationId: number
  medicationName: string | null
  movementType: MovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  note: string | null
  createdAt: string | null
}

export interface StockMovementInput {
  movementType: MovementType
  quantity: number
  note?: string | null
}

export interface StockMovementFilters {
  medicationId?: number
  movementType?: MovementType
  page?: number
  pageSize?: number
}

export interface PaginatedStockMovements {
  items: StockMovement[]
  total: number
  page: number
  pageSize: number
}
