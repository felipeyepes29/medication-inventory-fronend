import { useState } from "react"
import type { Medication, MedicationInput } from "@/domain/entities/medication"
import type { MovementType } from "@/domain/entities/stock-movement"
import { DeleteMedicationDialog } from "@/presentation/components/DeleteMedicationDialog"
import { InventoryFilters } from "@/presentation/components/InventoryFilters"
import { InventoryPagination } from "@/presentation/components/InventoryPagination"
import { InventoryTable } from "@/presentation/components/InventoryTable"
import { MedicationFormDialog } from "@/presentation/components/MedicationFormDialog"
import { StockMovementDialog } from "@/presentation/components/StockMovementDialog"
import { StockMovementHistoryDialog } from "@/presentation/components/StockMovementHistoryDialog"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { useMedications } from "@/presentation/hooks/useMedications"
import { clearAccessToken } from "@/infrastructure/auth/token-storage"
import { Button } from "@/shared/ui/button"

interface InventoryPageProps {
  onOpenBrands: () => void
  onOpenHistory: () => void
}

export function InventoryPage({ onOpenBrands, onOpenHistory }: InventoryPageProps) {
  const {
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
    setPageSizeOption,
    totalPages,
    clearFilters,
    createMedication,
    updateMedication,
    deleteMedication,
    registerMovement,
  } = useMedications()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [deleting, setDeleting] = useState<Medication | null>(null)
  const [movementMedication, setMovementMedication] = useState<Medication | null>(null)
  const [movementType, setMovementType] = useState<MovementType>("in")
  const [historyMedication, setHistoryMedication] = useState<Medication | null>(null)

  const handleSubmit = async (input: MedicationInput) => {
    if (editing) {
      await updateMedication(editing.id, input)
    } else {
      await createMedication(input)
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundImage: "var(--page-gradient)" }}>
      <div className="mx-auto flex w-full max-w-[1680px] min-w-0 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary sm:tracking-[0.18em]">
              Medicine Inventory
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Inventario de medicamentos
            </h1>
            <p className="text-muted-foreground">
              {total} registro{total === 1 ? "" : "s"} encontrados
            </p>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ThemeToggle />
            <Button type="button" variant="outline" onClick={onOpenHistory}>
              Historial
            </Button>
            <Button type="button" variant="outline" onClick={onOpenBrands}>
              Marcas
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearAccessToken()
                window.location.reload()
              }}
            >
              Salir
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              + Agregar
            </Button>
          </div>
        </header>

        <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <InventoryFilters
            q={q}
            onQChange={setQ}
            brand={brand}
            brands={brands}
            onBrandChange={setBrand}
            expirationStatus={expirationStatus}
            onExpirationStatusChange={setExpirationStatus}
            onClear={clearFilters}
          />

          <section className="flex min-w-0 flex-col gap-4 overflow-x-hidden">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <InventoryTable
              items={items}
              loading={loading}
              onEdit={(medication) => {
                setEditing(medication)
                setFormOpen(true)
              }}
              onDelete={setDeleting}
              onStockIn={(medication) => {
                setMovementMedication(medication)
                setMovementType("in")
              }}
              onStockOut={(medication) => {
                setMovementMedication(medication)
                setMovementType("out")
              }}
              onHistory={setHistoryMedication}
            />

            <InventoryPagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSizeOption={pageSizeOption}
              onPageChange={setPage}
              onPageSizeChange={setPageSizeOption}
            />
          </section>
        </div>
      </div>

      <MedicationFormDialog
        open={formOpen}
        medication={editing}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />

      <StockMovementDialog
        open={Boolean(movementMedication)}
        medication={movementMedication}
        movementType={movementType}
        onOpenChange={(open) => {
          if (!open) setMovementMedication(null)
        }}
        onSubmit={async (input) => {
          if (!movementMedication) return
          await registerMovement(movementMedication.id, input)
        }}
      />

      <StockMovementHistoryDialog
        open={Boolean(historyMedication)}
        medication={historyMedication}
        onOpenChange={(open) => {
          if (!open) setHistoryMedication(null)
        }}
      />

      <DeleteMedicationDialog
        open={Boolean(deleting)}
        medication={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        onConfirm={async () => {
          if (!deleting) return
          await deleteMedication(deleting.id)
          setDeleting(null)
        }}
      />
    </main>
  )
}
