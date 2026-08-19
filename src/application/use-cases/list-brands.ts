import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createListBrandsUseCase(repository: MedicationRepository) {
  return (siteId?: number, skipAuth?: boolean): Promise<string[]> =>
    repository.listBrands(siteId, skipAuth)
}
