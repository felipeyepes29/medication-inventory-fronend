import type { BrandInput } from "@/domain/entities/brand"
import type { BrandRepository } from "@/domain/repositories/brand-repository"

export function createUpdateBrandUseCase(repository: BrandRepository) {
  return (id: number, input: BrandInput) => repository.update(id, input)
}
