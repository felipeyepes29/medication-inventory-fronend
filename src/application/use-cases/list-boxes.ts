import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createListBoxesUseCase(repository: MedicationRepository) {
  return (siteId?: number, skipAuth?: boolean): Promise<string[]> =>
    repository.listBoxes(siteId, skipAuth)
}
