import type { Brand, BrandInput } from "@/domain/entities/brand"
import type { BrandRepository } from "@/domain/repositories/brand-repository"
import { apiClient } from "@/infrastructure/http/api-client"

interface BrandApi {
  id: number
  name: string
  site_id: number
  site_name: string | null
  created_at: string | null
  updated_at: string | null
}

function mapBrand(item: BrandApi): Brand {
  return {
    id: item.id,
    name: item.name,
    siteId: item.site_id,
    siteName: item.site_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  }
}

export class HttpBrandRepository implements BrandRepository {
  async list(siteId?: number): Promise<Brand[]> {
    const params = new URLSearchParams()
    if (siteId) params.set("site_id", String(siteId))
    const query = params.toString()
    const data = await apiClient<{ brands: BrandApi[] }>(
      `/api/brands${query ? `?${query}` : ""}`,
    )
    return data.brands.map(mapBrand)
  }

  async create(input: BrandInput): Promise<Brand> {
    const data = await apiClient<BrandApi>("/api/brands", {
      method: "POST",
      body: JSON.stringify({ name: input.name, site_id: input.siteId ?? null }),
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
