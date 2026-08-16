import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createListBrandsUseCase(repository: MedicationRepository) {
  return (): Promise<string[]> => repository.listBrands()
}
