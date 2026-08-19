export interface Brand {
  id: number
  name: string
  siteId: number
  siteName: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface BrandInput {
  name: string
  siteId?: number | null
}
