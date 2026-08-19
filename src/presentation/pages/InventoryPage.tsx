import { useEffect, useState } from "react"
import { LayoutDashboard, LogIn, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import type { Site } from "@/domain/entities/auth"
import type { Medication, MedicationInput } from "@/domain/entities/medication"
import type { MovementType } from "@/domain/entities/stock-movement"
import { listSites } from "@/infrastructure/repositories/http-site-repository"
import { DeleteMedicationDialog } from "@/presentation/components/DeleteMedicationDialog"
import { InventoryFilters } from "@/presentation/components/InventoryFilters"
import { InventoryPagination } from "@/presentation/components/InventoryPagination"
import { InventoryTable } from "@/presentation/components/InventoryTable"
import { MedicationFormDialog } from "@/presentation/components/MedicationFormDialog"
import { StockMovementDialog } from "@/presentation/components/StockMovementDialog"
import { StockMovementHistoryDialog } from "@/presentation/components/StockMovementHistoryDialog"
import { SiteFooter } from "@/presentation/components/SiteFooter"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { useAuth } from "@/presentation/hooks/useAuth"
import { useMedications } from "@/presentation/hooks/useMedications"
import { Button } from "@/shared/ui/button"

interface InventoryPageProps {
  mode: "public" | "manage"
}

export function InventoryPage({ mode }: InventoryPageProps) {
  const publicCatalog = mode === "public"
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"
  const {
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
    setPageSizeOption,
    totalPages,
    clearFilters,
    createMedication,
    updateMedication,
    deleteMedication,
    registerMovement,
  } = useMedications({ publicCatalog })

  const [sites, setSites] = useState<Site[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [deleting, setDeleting] = useState<Medication | null>(null)
  const [movementMedication, setMovementMedication] = useState<Medication | null>(null)
  const [movementType, setMovementType] = useState<MovementType>("in")
  const [historyMedication, setHistoryMedication] = useState<Medication | null>(null)

  useEffect(() => {
    let cancelled = false
    const loadSites = async () => {
      try {
        const result = await listSites({
          skipAuth: publicCatalog,
          includeInactive: !publicCatalog && isSuperAdmin,
        })
        if (!cancelled) setSites(result)
      } catch {
        if (!cancelled) setSites([])
      }
    }
    void loadSites()
    return () => {
      cancelled = true
    }
  }, [isSuperAdmin, publicCatalog])

  const handleSubmit = async (input: MedicationInput) => {
    if (editing) {
      await updateMedication(editing.id, input)
    } else {
      await createMedication(input)
    }
  }

  const showSiteFilter = publicCatalog || isSuperAdmin
  const showSiteColumn = publicCatalog || isSuperAdmin

  return (
    <div
      className={publicCatalog ? "flex min-h-screen flex-col overflow-x-hidden" : "overflow-x-hidden"}
      style={publicCatalog ? { backgroundImage: "var(--page-gradient)" } : undefined}
    >
      <main className={publicCatalog ? "flex-1" : undefined}>
      <div className="mx-auto flex w-full max-w-[1680px] min-w-0 flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary sm:tracking-[0.18em]">
              Medicine Inventory
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {publicCatalog ? "Catálogo de medicamentos" : "Inventario de medicamentos"}
            </h1>
            <p className="text-muted-foreground">
              {publicCatalog
                ? "Consulta disponibilidad y la sede donde puedes reclamar. Solo aparecen centros que publicaron su inventario."
                : user?.role === "site_user" && user.siteName
                  ? `Sede: ${user.siteName}`
                  : `${total} registro${total === 1 ? "" : "s"} encontrados`}
            </p>
            {publicCatalog ? (
              <p className="text-sm text-muted-foreground">
                {total} registro{total === 1 ? "" : "s"} encontrados
              </p>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {publicCatalog ? <ThemeToggle /> : null}
            {publicCatalog ? (
              <Button asChild variant="outline">
                <Link to={user ? "/app" : "/login"}>
                  {user ? <LayoutDashboard className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {user ? "Gestionar" : "Ingresar"}
                </Link>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            )}
          </div>
        </header>

        <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
          <InventoryFilters
            q={q}
            onQChange={setQ}
            brand={brand}
            brands={brands}
            onBrandChange={setBrand}
            box={box}
            boxes={boxes}
            onBoxChange={setBox}
            expirationStatus={expirationStatus}
            onExpirationStatusChange={setExpirationStatus}
            onClear={clearFilters}
            siteId={showSiteFilter ? siteId : undefined}
            sites={showSiteFilter ? sites : undefined}
            onSiteChange={showSiteFilter ? setSiteId : undefined}
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
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={toggleSort}
              readOnly={publicCatalog}
              showSite={showSiteColumn}
              onEdit={
                publicCatalog
                  ? undefined
                  : (medication) => {
                      setEditing(medication)
                      setFormOpen(true)
                    }
              }
              onDelete={publicCatalog ? undefined : setDeleting}
              onStockIn={
                publicCatalog
                  ? undefined
                  : (medication) => {
                      setMovementMedication(medication)
                      setMovementType("in")
                    }
              }
              onStockOut={
                publicCatalog
                  ? undefined
                  : (medication) => {
                      setMovementMedication(medication)
                      setMovementType("out")
                    }
              }
              onHistory={publicCatalog ? undefined : setHistoryMedication}
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

      {publicCatalog ? null : (
        <>
          <MedicationFormDialog
            open={formOpen}
            medication={editing}
            onOpenChange={setFormOpen}
            onSubmit={handleSubmit}
            sites={sites}
            requireSite={isSuperAdmin}
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
        </>
      )}
    </main>
      {publicCatalog ? <SiteFooter /> : null}
    </div>
  )
}
