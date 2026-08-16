import type { BrandInput } from "@/domain/entities/brand"
import type { BrandRepository } from "@/domain/repositories/brand-repository"

export function createCreateBrandUseCase(repository: BrandRepository) {
  return (input: BrandInput) => repository.create(input)
}
