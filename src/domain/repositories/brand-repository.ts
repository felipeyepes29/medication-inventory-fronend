import type { Brand, BrandInput } from "@/domain/entities/brand"

export interface BrandRepository {
  list(siteId?: number): Promise<Brand[]>
  create(input: BrandInput): Promise<Brand>
  update(id: number, input: BrandInput): Promise<Brand>
  delete(id: number): Promise<void>
}
