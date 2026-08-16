import type { Brand, BrandInput } from "@/domain/entities/brand"
import type { BrandRepository } from "@/domain/repositories/brand-repository"
import { apiClient } from "@/infrastructure/http/api-client"

interface BrandApi {
  id: number
  name: string
  created_at: string | null
  updated_at: string | null
}

function mapBrand(item: BrandApi): Brand {
  return {
    id: item.id,
    name: item.name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export class HttpBrandRepository implements BrandRepository {
  async list(): Promise<Brand[]> {
    const data = await apiClient<{ brands: BrandApi[] }>("/api/brands")
    return data.brands.map(mapBrand)
  }

  async create(input: BrandInput): Promise<Brand> {
    const data = await apiClient<BrandApi>("/api/brands", {
      method: "POST",
      body: JSON.stringify({ name: input.name }),
    })
    return mapBrand(data)
  }

  async update(id: number, input: BrandInput): Promise<Brand> {
    const data = await apiClient<BrandApi>(`/api/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name: input.name }),
    })
    return mapBrand(data)
  }

  async delete(id: number): Promise<void> {
    await apiClient<void>(`/api/brands/${id}`, { method: "DELETE" })
  }
}
