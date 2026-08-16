import type {
  PaginatedStockMovements,
  StockMovementFilters,
} from "@/domain/entities/stock-movement"
import type { StockMovementRepository } from "@/domain/repositories/stock-movement-repository"

export function createListStockMovementsUseCase(repository: StockMovementRepository) {
  return (filters: StockMovementFilters): Promise<PaginatedStockMovements> =>
    repository.list(filters)
}
