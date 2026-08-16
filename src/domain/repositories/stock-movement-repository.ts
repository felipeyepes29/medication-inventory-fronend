import type {
  PaginatedStockMovements,
  StockMovement,
  StockMovementFilters,
  StockMovementInput,
} from "@/domain/entities/stock-movement"

export interface StockMovementRepository {
  list(filters: StockMovementFilters): Promise<PaginatedStockMovements>
  register(medicationId: number, input: StockMovementInput): Promise<StockMovement>
}
