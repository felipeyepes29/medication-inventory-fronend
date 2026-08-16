import { useCallback, useEffect, useState } from "react"
import { stockMovementUseCases } from "@/application/composition"
import type { MovementType, StockMovement } from "@/domain/entities/stock-movement"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
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

interface HistoryPageProps {
  onBack: () => void
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

type TypeFilter = "all" | MovementType

export function HistoryPage({ onBack }: HistoryPageProps) {
  const [items, setItems] = useState<StockMovement[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("out")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 30
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await stockMovementUseCases.list({
        movementType: typeFilter === "all" ? undefined : typeFilter,
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
  }, [page, typeFilter])

  useEffect(() => {
    setPage(1)
  }, [typeFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundImage: "var(--page-gradient)" }}>
      <div className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
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
          <Button type="button" variant="outline" onClick={onBack}>
            Volver al inventario
          </Button>
        </header>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-56">
            <Select
              value={typeFilter}
              onValueChange={(value) => setTypeFilter(value as TypeFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="out">Solo salidas</SelectItem>
                <SelectItem value="in">Solo entradas</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            items.map((item) => (
              <li key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                    <h3 className="mt-0.5 font-semibold leading-snug">
                      {item.medicationName ?? `Medicamento #${item.medicationId}`}
                    </h3>
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
              </li>
            ))
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Antes</TableHead>
                  <TableHead>Después</TableHead>
                  <TableHead>Nota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="font-medium">
                      {item.medicationName ?? `#${item.medicationId}`}
                    </TableCell>
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
                    <TableCell className="max-w-[220px] truncate">{item.note || "—"}</TableCell>
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
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  )
}
