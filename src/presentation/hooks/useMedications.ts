import { useCallback, useEffect, useState } from "react"
import { medicationUseCases, stockMovementUseCases } from "@/application/composition"
import type {
  ExpirationStatus,
  Medication,
  MedicationInput,
  SortField,
  SortOrder,
} from "@/domain/entities/medication"
import type { StockMovementInput } from "@/domain/entities/stock-movement"

export type PageSizeOption = 20 | 30 | 50 | 100 | "all"

const ALL_PAGE_SIZE = 10000

function resolvePageSize(option: PageSizeOption): number {
  return option === "all" ? ALL_PAGE_SIZE : option
}

interface UseMedicationsOptions {
  publicCatalog?: boolean
}

export function useMedications({ publicCatalog = false }: UseMedicationsOptions = {}) {
  const [items, setItems] = useState<Medication[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [boxes, setBoxes] = useState<string[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [brand, setBrand] = useState<string>("all")
  const [box, setBox] = useState<string>("all")
  const [siteId, setSiteId] = useState<string>("all")
  const [expirationStatus, setExpirationStatus] = useState<ExpirationStatus>("all")
  const [sortBy, setSortBy] = useState<SortField>("position")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [page, setPage] = useState(1)
  const [pageSizeOption, setPageSizeOption] = useState<PageSizeOption>(20)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [q])

  useEffect(() => {
    setPage(1)
  }, [debouncedQ, brand, box, siteId, expirationStatus, sortBy, sortOrder])

  const changePageSize = (value: PageSizeOption) => {
    setPageSizeOption(value)
    setPage(1)
  }

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }
    setSortBy(field)
    setSortOrder("asc")
  }

  const resolvedSiteId = siteId === "all" ? undefined : Number(siteId)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const pageSize = resolvePageSize(pageSizeOption)
          const [listResult, brandResult, boxResult] = await Promise.all([
        medicationUseCases.list({
          q: debouncedQ || undefined,
          brand: brand === "all" ? undefined : brand,
          box: publicCatalog || box === "all" ? undefined : box,
          siteId: resolvedSiteId,
          expirationStatus,
          sortBy,
          sortOrder,
          page: pageSizeOption === "all" ? 1 : page,
          pageSize,
          skipAuth: publicCatalog,
        }),
        medicationUseCases.listBrands(resolvedSiteId, publicCatalog),
        publicCatalog ? Promise.resolve([]) : medicationUseCases.listBoxes(resolvedSiteId, publicCatalog),
      ])
      setItems(listResult.items)
      setTotal(listResult.total)
      setBrands(brandResult)
      setBoxes(boxResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el inventario")
    } finally {
      setLoading(false)
    }
  }, [
    brand,
    box,
    debouncedQ,
    expirationStatus,
    page,
    pageSizeOption,
    publicCatalog,
    resolvedSiteId,
    sortBy,
    sortOrder,
  ])

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
    setBox("all")
    setSiteId("all")
    setExpirationStatus("all")
    setPage(1)
  }

  const totalPages =
    pageSizeOption === "all" ? 1 : Math.max(1, Math.ceil(total / pageSizeOption))

  return {
    items,
    brands,
    boxes,
    total,
    loading,
    error,
    q,
    setQ,
    brand,
    setBrand,
    box,
    setBox,
    siteId,
    setSiteId,
    expirationStatus,
    setExpirationStatus,
    sortBy,
    sortOrder,
    toggleSort,
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
