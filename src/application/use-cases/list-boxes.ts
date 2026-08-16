import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createListBoxesUseCase(repository: MedicationRepository) {
  return (): Promise<string[]> => repository.listBoxes()
}
