import type { Site } from "@/domain/entities/auth"
import { apiClient } from "@/infrastructure/http/api-client"

interface SiteApi {
  id: number
  name: string
  address: string | null
  is_active: boolean
  is_public: boolean
}

function mapSite(item: SiteApi): Site {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    isActive: item.is_active,
    isPublic: item.is_public,
  }
}

export async function listSites(options?: {
  includeInactive?: boolean
  skipAuth?: boolean
}): Promise<Site[]> {
  const params = new URLSearchParams()
  if (options?.includeInactive) params.set("include_inactive", "true")
  const query = params.toString()
  const data = await apiClient<{ sites: SiteApi[] }>(
    `/api/sites${query ? `?${query}` : ""}`,
    { skipAuth: options?.skipAuth },
  )
  return data.sites.map(mapSite)
}

export async function createSite(input: {
  name: string
  address: string | null
  isActive: boolean
  isPublic: boolean
}): Promise<Site> {
  const data = await apiClient<SiteApi>("/api/sites", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      address: input.address,
      is_active: input.isActive,
      is_public: input.isPublic,
    }),
  })
  return mapSite(data)
}

export async function updateSite(
  id: number,
  input: { name: string; address: string | null; isActive: boolean; isPublic: boolean },
): Promise<Site> {
  const data = await apiClient<SiteApi>(`/api/sites/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      name: input.name,
      address: input.address,
      is_active: input.isActive,
      is_public: input.isPublic,
    }),
  })
  return mapSite(data)
}

export async function updateSiteVisibility(id: number, isPublic: boolean): Promise<Site> {
  const data = await apiClient<SiteApi>(`/api/sites/${id}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ is_public: isPublic }),
  })
  return mapSite(data)
}
