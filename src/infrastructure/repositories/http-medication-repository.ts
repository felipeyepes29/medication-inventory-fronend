import type {
  Medication,
  MedicationFilters,
  MedicationInput,
  PaginatedMedications,
} from "@/domain/entities/medication"
import type { MedicationRepository } from "@/domain/repositories/medication-repository"
import { apiClient } from "@/infrastructure/http/api-client"

interface MedicationApi {
  id: number
  position: number
  name: string
  quantity: number
  concentration: string
  brand: string
  box: string | null
  expiration_date: string | null
  created_at: string | null
  updated_at: string | null
}

interface PaginatedApi {
  items: MedicationApi[]
  total: number
  page: number
  page_size: number
}

function mapMedication(item: MedicationApi): Medication {
  return {
    id: item.id,
    position: item.position,
    name: item.name,
    quantity: item.quantity,
    concentration: item.concentration,
    brand: item.brand,
    box: item.box,
    expirationDate: item.expiration_date,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export class HttpMedicationRepository implements MedicationRepository {
  async list(filters: MedicationFilters): Promise<PaginatedMedications> {
    const params = new URLSearchParams()
    if (filters.q) params.set("q", filters.q)
    if (filters.brand) params.set("brand", filters.brand)
    if (filters.expirationStatus) {
      params.set("expiration_status", filters.expirationStatus)
    }
    params.set("page", String(filters.page ?? 1))
    params.set("page_size", String(filters.pageSize ?? 100))

    const data = await apiClient<PaginatedApi>(`/api/medications?${params}`)
    return {
      items: data.items.map(mapMedication),
      total: data.total,
      page: data.page,
      pageSize: data.page_size,
    }
  }

  async getById(id: number): Promise<Medication> {
    const data = await apiClient<MedicationApi>(`/api/medications/${id}`)
    return mapMedication(data)
  }

  async getNextPosition(): Promise<number> {
    const data = await apiClient<{ position: number }>("/api/medications/next-position")
    return data.position
  }

  async create(input: MedicationInput): Promise<Medication> {
    const data = await apiClient<MedicationApi>("/api/medications", {
      method: "POST",
      body: JSON.stringify({
        position: input.position,
        name: input.name,
        quantity: input.quantity,
        concentration: input.concentration,
        brand: input.brand,
        box: input.box,
        expiration_date: input.expirationDate,
      }),
    })
    return mapMedication(data)
  }

  async update(id: number, input: MedicationInput): Promise<Medication> {
    const data = await apiClient<MedicationApi>(`/api/medications/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        position: input.position,
        name: input.name,
        quantity: input.quantity,
        concentration: input.concentration,
        brand: input.brand,
        box: input.box,
        expiration_date: input.expirationDate,
      }),
    })
    return mapMedication(data)
  }

  async delete(id: number): Promise<void> {
    await apiClient<void>(`/api/medications/${id}`, { method: "DELETE" })
  }

  async listBrands(): Promise<string[]> {
    const data = await apiClient<{ brands: string[] }>("/api/medications/brands")
    return data.brands
  }
}
