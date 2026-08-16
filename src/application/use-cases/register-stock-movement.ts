import type { StockMovement, StockMovementInput } from "@/domain/entities/stock-movement"
import type { StockMovementRepository } from "@/domain/repositories/stock-movement-repository"

export function createRegisterStockMovementUseCase(repository: StockMovementRepository) {
  return (medicationId: number, input: StockMovementInput): Promise<StockMovement> =>
    repository.register(medicationId, input)
}
