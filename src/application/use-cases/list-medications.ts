import type { MedicationFilters, PaginatedMedications } from "@/domain/entities/medication"
import type { MedicationRepository } from "@/domain/repositories/medication-repository"

export function createListMedicationsUseCase(repository: MedicationRepository) {
  return (filters: MedicationFilters): Promise<PaginatedMedications> =>
    repository.list(filters)
}
