import { createCreateBrandUseCase } from "@/application/use-cases/create-brand"
import { createCreateMedicationUseCase } from "@/application/use-cases/create-medication"
import { createDeleteBrandUseCase } from "@/application/use-cases/delete-brand"
import { createDeleteMedicationUseCase } from "@/application/use-cases/delete-medication"
import { createGetNextPositionUseCase } from "@/application/use-cases/get-next-position"
import { createListBoxesUseCase } from "@/application/use-cases/list-boxes"
import { createListBrandsUseCase } from "@/application/use-cases/list-brands"
import { createListBrandsCatalogUseCase } from "@/application/use-cases/list-brands-catalog"
import { createListMedicationsUseCase } from "@/application/use-cases/list-medications"
import { createListStockMovementsUseCase } from "@/application/use-cases/list-stock-movements"
import { createRegisterStockMovementUseCase } from "@/application/use-cases/register-stock-movement"
import { createUpdateBrandUseCase } from "@/application/use-cases/update-brand"
import { createUpdateMedicationUseCase } from "@/application/use-cases/update-medication"
import { HttpBrandRepository } from "@/infrastructure/repositories/http-brand-repository"
import { HttpMedicationRepository } from "@/infrastructure/repositories/http-medication-repository"
import { HttpStockMovementRepository } from "@/infrastructure/repositories/http-stock-movement-repository"

const medicationRepository = new HttpMedicationRepository()
const brandRepository = new HttpBrandRepository()
const stockMovementRepository = new HttpStockMovementRepository()

export const medicationUseCases = {
  list: createListMedicationsUseCase(medicationRepository),
  create: createCreateMedicationUseCase(medicationRepository),
  update: createUpdateMedicationUseCase(medicationRepository),
  delete: createDeleteMedicationUseCase(medicationRepository),
  listBrands: createListBrandsUseCase(medicationRepository),
  listBoxes: createListBoxesUseCase(medicationRepository),
  getNextPosition: createGetNextPositionUseCase(medicationRepository),
}

export const brandUseCases = {
  list: createListBrandsCatalogUseCase(brandRepository),
  create: createCreateBrandUseCase(brandRepository),
  update: createUpdateBrandUseCase(brandRepository),
  delete: createDeleteBrandUseCase(brandRepository),
}

export const stockMovementUseCases = {
  list: createListStockMovementsUseCase(stockMovementRepository),
  register: createRegisterStockMovementUseCase(stockMovementRepository),
}
