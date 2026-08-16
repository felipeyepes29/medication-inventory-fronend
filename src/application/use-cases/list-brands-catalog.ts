import type { BrandRepository } from "@/domain/repositories/brand-repository"

export function createListBrandsCatalogUseCase(repository: BrandRepository) {
  return () => repository.list()
}
