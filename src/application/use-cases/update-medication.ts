import type { Medication, MedicationInput } from "@/domain/entities/medication"
import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createUpdateMedicationUseCase(repository: MedicationRepository) {
  return (id: number, input: MedicationInput): Promise<Medication> =>
    repository.update(id, input)
}
