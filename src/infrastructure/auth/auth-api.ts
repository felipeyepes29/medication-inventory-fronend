import { apiClient } from "@/infrastructure/http/api-client"
import { setAccessToken } from "@/infrastructure/auth/token-storage"

export async function fetchAuthStatus(): Promise<boolean> {
  const data = await apiClient<{ auth_required: boolean }>("/api/auth/status")
  return data.auth_required
}

export async function loginWithPassword(password: string): Promise<void> {
  const data = await apiClient<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  })
  setAccessToken(data.access_token)
}
