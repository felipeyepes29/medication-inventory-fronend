export interface Brand {
  id: number
  name: string
  createdAt: string | null
  updatedAt: string | null
}

export interface BrandInput {
  name: string
}
