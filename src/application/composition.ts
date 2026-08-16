import { createCreateMedicationUseCase } from "@/application/use-cases/create-medication"
import { createDeleteMedicationUseCase } from "@/application/use-cases/delete-medication"
import { createListBrandsUseCase } from "@/application/use-cases/list-brands"
import { createListMedicationsUseCase } from "@/application/use-cases/list-medications"
import { createListStockMovementsUseCase } from "@/application/use-cases/list-stock-movements"
import { createRegisterStockMovementUseCase } from "@/application/use-cases/register-stock-movement"
import { createUpdateMedicationUseCase } from "@/application/use-cases/update-medication"
import { HttpMedicationRepository } from "@/infrastructure/repositories/http-medication-repository"
import { HttpStockMovementRepository } from "@/infrastructure/repositories/http-stock-movement-repository"

const medicationRepository = new HttpMedicationRepository()
const stockMovementRepository = new HttpStockMovementRepository()

export const medicationUseCases = {
  list: createListMedicationsUseCase(medicationRepository),
  create: createCreateMedicationUseCase(medicationRepository),
  update: createUpdateMedicationUseCase(medicationRepository),
  delete: createDeleteMedicationUseCase(medicationRepository),
  listBrands: createListBrandsUseCase(medicationRepository),
}

export const stockMovementUseCases = {
  list: createListStockMovementsUseCase(stockMovementRepository),
  register: createRegisterStockMovementUseCase(stockMovementRepository),
}
