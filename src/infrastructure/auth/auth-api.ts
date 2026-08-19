import type { AuthUser } from "@/domain/entities/auth"
import { apiClient } from "@/infrastructure/http/api-client"
import { setAccessToken } from "@/infrastructure/auth/token-storage"

export interface UserApi {
  id: number
  email: string
  role: "super_admin" | "site_user"
  site_id: number | null
  site_name: string | null
  site_is_public: boolean | null
  is_active: boolean
}

export function mapUser(item: UserApi): AuthUser {
  return {
    id: item.id,
    email: item.email,
    role: item.role,
    siteId: item.site_id,
    siteName: item.site_name,
    siteIsPublic: item.site_is_public,
    isActive: item.is_active,
  }
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthUser> {
  const data = await apiClient<{ access_token: string; user: UserApi }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  })
  setAccessToken(data.access_token)
  return mapUser(data.user)
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  return mapUser(await apiClient<UserApi>("/api/auth/me"))
}
