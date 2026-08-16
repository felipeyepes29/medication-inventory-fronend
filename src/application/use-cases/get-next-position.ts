import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createGetNextPositionUseCase(repository: MedicationRepository) {
  return (): Promise<number> => repository.getNextPosition()
}
