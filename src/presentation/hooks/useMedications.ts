import { useCallback, useEffect, useState } from "react"
import { medicationUseCases, stockMovementUseCases } from "@/application/composition"
import type {
  ExpirationStatus,
  Medication,
  MedicationInput,
} from "@/domain/entities/medication"
import type { StockMovementInput } from "@/domain/entities/stock-movement"

export type PageSizeOption = 20 | 30 | 50 | 100 | "all"

const ALL_PAGE_SIZE = 10000

function resolvePageSize(option: PageSizeOption): number {
  return option === "all" ? ALL_PAGE_SIZE : option
}

export function useMedications() {
  const [items, setItems] = useState<Medication[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [brand, setBrand] = useState<string>("all")
  const [expirationStatus, setExpirationStatus] = useState<ExpirationStatus>("all")
  const [page, setPage] = useState(1)
  const [pageSizeOption, setPageSizeOption] = useState<PageSizeOption>(20)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, brand, expirationStatus])

  const changePageSize = (value: PageSizeOption) => {
    setPageSizeOption(value)
    setPage(1)
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const pageSize = resolvePageSize(pageSizeOption)
      const [listResult, brandResult] = await Promise.all([
        medicationUseCases.list({
          q: debouncedQ || undefined,
          brand: brand === "all" ? undefined : brand,
          expirationStatus,
          page: pageSizeOption === "all" ? 1 : page,
          pageSize,
        }),
        medicationUseCases.listBrands(),
      ])
      setItems(listResult.items)
      setTotal(listResult.total)
      setBrands(brandResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el inventario")
    } finally {
      setLoading(false)
    }
  }, [brand, debouncedQ, expirationStatus, page, pageSizeOption])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createMedication = async (input: MedicationInput) => {
    await medicationUseCases.create(input)
    await refresh()
  }

  const updateMedication = async (id: number, input: MedicationInput) => {
    await medicationUseCases.update(id, input)
    await refresh()
  }

  const deleteMedication = async (id: number) => {
    await medicationUseCases.delete(id)
    await refresh()
  }

  const registerMovement = async (medicationId: number, input: StockMovementInput) => {
    await stockMovementUseCases.register(medicationId, input)
    await refresh()
  }

  const clearFilters = () => {
    setQ("")
    setBrand("all")
    setExpirationStatus("all")
    setPage(1)
  }

  const totalPages =
    pageSizeOption === "all" ? 1 : Math.max(1, Math.ceil(total / pageSizeOption))

  return {
    items,
    brands,
    total,
    loading,
    error,
    q,
    setQ,
    brand,
    setBrand,
    expirationStatus,
    setExpirationStatus,
    page,
    setPage,
    pageSizeOption,
    setPageSizeOption: changePageSize,
    totalPages,
    clearFilters,
    createMedication,
    updateMedication,
    deleteMedication,
    registerMovement,
    refresh,
  }
}
