import type {
  Medication,
  MedicationFilters,
  MedicationInput,
  PaginatedMedications,
} from "@/domain/entities/medication"

export interface MedicationRepository {
  list(filters: MedicationFilters): Promise<PaginatedMedications>
  getById(id: number): Promise<Medication>
  getNextPosition(): Promise<number>
  create(input: MedicationInput): Promise<Medication>
  update(id: number, input: MedicationInput): Promise<Medication>
  delete(id: number): Promise<void>
  listBrands(siteId?: number, skipAuth?: boolean): Promise<string[]>
  listBoxes(siteId?: number, skipAuth?: boolean): Promise<string[]>
}
