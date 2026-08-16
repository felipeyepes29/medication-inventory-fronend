import type {
  PaginatedStockMovements,
  StockMovement,
  StockMovementFilters,
  StockMovementInput,
} from "@/domain/entities/stock-movement"
import type { StockMovementRepository } from "@/domain/repositories/stock-movement-repository"
import { apiClient } from "@/infrastructure/http/api-client"

interface StockMovementApi {
  id: number
  medication_id: number
  medication_name: string | null
  movement_type: "in" | "out"
  quantity: number
  previous_quantity: number
  new_quantity: number
  note: string | null
  created_at: string | null
}

interface PaginatedApi {
  items: StockMovementApi[]
  total: number
  page: number
  page_size: number
}

function mapMovement(item: StockMovementApi): StockMovement {
  return {
    id: item.id,
    medicationId: item.medication_id,
    medicationName: item.medication_name,
    movementType: item.movement_type,
    quantity: item.quantity,
    previousQuantity: item.previous_quantity,
    newQuantity: item.new_quantity,
    note: item.note,
    createdAt: item.created_at,
  }
}

export class HttpStockMovementRepository implements StockMovementRepository {
  async list(filters: StockMovementFilters): Promise<PaginatedStockMovements> {
    const params = new URLSearchParams()
    if (filters.medicationId) params.set("medication_id", String(filters.medicationId))
    if (filters.movementType) params.set("movement_type", filters.movementType)
    params.set("page", String(filters.page ?? 1))
    params.set("page_size", String(filters.pageSize ?? 20))

    const path = filters.medicationId
      ? `/api/medications/${filters.medicationId}/movements?${params}`
      : `/api/stock-movements?${params}`

    const data = await apiClient<PaginatedApi>(path)
    return {
      items: data.items.map(mapMovement),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
    }
  }

  async register(medicationId: number, input: StockMovementInput): Promise<StockMovement> {
    const data = await apiClient<StockMovementApi>(
      `/api/medications/${medicationId}/movements`,
      {
        method: "POST",
        body: JSON.stringify({
          movement_type: input.movementType,
          quantity: input.quantity,
          note: input.note ?? null,
        }),
      },
    )
    return mapMovement(data)
  }
}
