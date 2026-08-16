import type { Medication, MedicationInput } from "@/domain/entities/medication"
import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createCreateMedicationUseCase(repository: MedicationRepository) {
  return (input: MedicationInput): Promise<Medication> => repository.create(input)
}
