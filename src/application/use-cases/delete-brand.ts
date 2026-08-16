import type { BrandRepository } from "@/domain/repositories/brand-repository"

export function createDeleteBrandUseCase(repository: BrandRepository) {
  return (id: number) => repository.delete(id)
}
