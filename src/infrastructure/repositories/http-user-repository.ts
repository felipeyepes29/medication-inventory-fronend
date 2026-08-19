import type { AuthUser, ManagedUser, UserRole } from "@/domain/entities/auth"
import { mapUser, type UserApi } from "@/infrastructure/auth/auth-api"
import { apiClient } from "@/infrastructure/http/api-client"

export async function listUsers(): Promise<ManagedUser[]> {
  const data = await apiClient<{ users: UserApi[] }>("/api/users")
  return data.users.map(mapUser)
}

export async function createUser(input: {
  email: string
  password: string
  role: UserRole
  siteId: number | null
  isActive: boolean
}): Promise<AuthUser> {
  return mapUser(
    await apiClient("/api/users", {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        role: input.role,
        site_id: input.siteId,
        is_active: input.isActive,
      }),
    }),
  )
}

export async function updateUser(
  id: number,
  input: {
    email: string
    password?: string
    role: UserRole
    siteId: number | null
    isActive: boolean
  },
): Promise<AuthUser> {
  return mapUser(
    await apiClient(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        email: input.email,
        password: input.password || null,
        role: input.role,
        site_id: input.siteId,
        is_active: input.isActive,
      }),
    }),
  )
}

function toUpdatePayload(user: ManagedUser, patch?: { isActive?: boolean; password?: string }) {
  return {
    email: user.email,
    role: user.role,
    siteId: user.siteId,
    isActive: patch?.isActive ?? user.isActive,
    password: patch?.password,
  }
}

export function setUserActive(user: ManagedUser, isActive: boolean): Promise<AuthUser> {
  return updateUser(user.id, toUpdatePayload(user, { isActive }))
}

export function changeUserPassword(user: ManagedUser, password: string): Promise<AuthUser> {
  return updateUser(user.id, toUpdatePayload(user, { password }))
}
