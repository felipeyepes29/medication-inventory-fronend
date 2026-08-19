import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Building2, ChevronLeft, ChevronRight, List } from "lucide-react"
import { Link } from "react-router-dom"
import { stockMovementUseCases } from "@/application/composition"
import type { Site } from "@/domain/entities/auth"
import { formatRecipient, type MovementType, type StockMovement } from "@/domain/entities/stock-movement"
import { listSites } from "@/infrastructure/repositories/http-site-repository"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

type TypeFilter = "all" | MovementType

export function HistoryPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"
  const [items, setItems] = useState<StockMovement[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [siteFilter, setSiteFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 30
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showSite = isSuperAdmin

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await stockMovementUseCases.list({
        movementType: typeFilter === "all" ? undefined : typeFilter,
        siteId: isSuperAdmin && siteFilter !== "all" ? Number(siteFilter) : undefined,
        page,
        pageSize,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial")
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin, page, siteFilter, typeFilter])

  useEffect(() => {
    if (!isSuperAdmin) return
    void listSites({ includeInactive: true }).then(setSites).catch(() => setSites([]))
  }, [isSuperAdmin])

  useEffect(() => {
    setPage(1)
  }, [siteFilter, typeFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <main className="overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Medicine Inventory
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Historial de movimientos
            </h1>
            <p className="text-muted-foreground">
              {total} registro{total === 1 ? "" : "s"}
              {typeFilter === "out" ? " de salidas" : typeFilter === "in" ? " de entradas" : ""}
            </p>
          </div>
          <Button asChild type="button" variant="outline">
            <Link to="/app">
              <ArrowLeft className="h-4 w-4" />
              Volver al inventario
            </Link>
          </Button>
        </header>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground">Tipo de movimiento</Label>
            <RadioGroup
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
              className="flex flex-wrap gap-x-5 gap-y-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="history-all" />
                <Label htmlFor="history-all" className="inline-flex cursor-pointer items-center gap-1.5 font-normal">
                  <List className="h-3.5 w-3.5" />
                  Todos
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="in" id="history-in" />
                <Label htmlFor="history-in" className="inline-flex cursor-pointer items-center gap-1.5 font-normal">
                  <ArrowDownToLine className="h-3.5 w-3.5" />
                  Entradas
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="out" id="history-out" />
                <Label htmlFor="history-out" className="inline-flex cursor-pointer items-center gap-1.5 font-normal">
                  <ArrowUpFromLine className="h-3.5 w-3.5" />
                  Salidas
                </Label>
              </div>
            </RadioGroup>
          </div>
          {showSite ? (
            <div className="grid w-full gap-2 sm:w-64">
              <Label className="text-muted-foreground">Sede</Label>
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger>
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Todas las sedes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sedes</SelectItem>
                  {sites.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {/* Mobile cards */}
        <ul className="grid gap-3 md:hidden">
          {loading ? (
            <li className="py-10 text-center text-sm text-muted-foreground">Cargando...</li>
          ) : items.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted-foreground">
              No hay movimientos todavía.
            </li>
          ) : (
            items.map((item) => {
              const recipient = formatRecipient(item)
              return (
              <li key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    <h3 className="mt-0.5 font-semibold leading-snug">
                      {item.medicationName ?? `Medicamento #${item.medicationId}`}
                    </h3>
                    {showSite && item.siteName ? (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.siteName}</p>
                    ) : null}
                  </div>
                  {item.movementType === "in" ? (
                    <Badge variant="success">Entrada</Badge>
                  ) : (
                    <Badge variant="danger">Salida</Badge>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Cantidad</dt>
                    <dd className="font-medium">
                      {item.movementType === "in" ? "+" : "-"}
                      {item.quantity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Antes</dt>
                    <dd>{item.previousQuantity}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase text-muted-foreground">Después</dt>
                    <dd>{item.newQuantity}</dd>
                  </div>
                </dl>
                {item.note ? (
                  <p className="mt-2 truncate text-sm text-muted-foreground">{item.note}</p>
                ) : null}
                {recipient ? (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    Entregado a: {recipient}
                  </p>
                ) : null}
              </li>
              )
            })
          )}
        </ul>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Cargando...</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No hay movimientos todavía.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Medicamento</TableHead>
                  {showSite ? <TableHead>Sede</TableHead> : null}
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Antes</TableHead>
                  <TableHead>Después</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Entregado a</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="font-medium">
                      {item.medicationName ?? `#${item.medicationId}`}
                    </TableCell>
                    {showSite ? (
                      <TableCell className="text-muted-foreground">{item.siteName || "—"}</TableCell>
                    ) : null}
                    <TableCell>
                      {item.movementType === "in" ? (
                        <Badge variant="success">Entrada</Badge>
                      ) : (
                        <Badge variant="danger">Salida</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.movementType === "in" ? "+" : "-"}
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.previousQuantity}</TableCell>
                    <TableCell>{item.newQuantity}</TableCell>
                    <TableCell className="max-w-[180px] truncate">{item.note || "—"}</TableCell>
                    <TableCell className="max-w-[220px] truncate">
                      {formatRecipient(item) || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              {page}/{totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
