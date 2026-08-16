import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createDeleteMedicationUseCase(repository: MedicationRepository) {
  return (id: number): Promise<void> => repository.delete(id)
}
