export type UserRole = "super_admin" | "site_user"

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  siteId: number | null
  siteName: string | null
  siteIsPublic: boolean | null
  isActive: boolean
}

export interface Site {
  id: number
  name: string
  address: string | null
  isActive: boolean
  isPublic: boolean
}

export interface ManagedUser {
  id: number
  email: string
  role: UserRole
  siteId: number | null
  siteName: string | null
  isActive: boolean
}
