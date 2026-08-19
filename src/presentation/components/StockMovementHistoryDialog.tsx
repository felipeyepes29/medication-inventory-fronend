import { useEffect, useState } from "react"
import { stockMovementUseCases } from "@/application/composition"
import type { Medication } from "@/domain/entities/medication"
import { formatRecipient, type StockMovement } from "@/domain/entities/stock-movement"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

interface StockMovementHistoryDialogProps {
  open: boolean
  medication: Medication | null
  onOpenChange: (open: boolean) => void
}

function formatDate(value: string | null): string {
  if (!value) return "—"
  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  })
}

export function StockMovementHistoryDialog({
  open,
  medication,
  onOpenChange,
}: StockMovementHistoryDialogProps) {
  const [items, setItems] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !medication) return

    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await stockMovementUseCases.list({
          medicationId: medication.id,
          page: 1,
          pageSize: 50,
        })
        if (!cancelled) setItems(result.items)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el historial")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [medication, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Historial de movimientos</DialogTitle>
          <DialogDescription>
            {medication
              ? `Entradas y salidas de ${medication.name}. Stock actual: ${medication.quantity}.`
              : "Entradas y salidas del medicamento."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Cargando historial...</p>
        ) : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {!loading && !error && items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Aún no hay movimientos registrados.
          </p>
        ) : null}

        {!loading && items.length > 0 ? (
          <>
            {/* Mobile cards */}
            <ul className="grid max-h-[min(70vh,520px)] gap-3 overflow-y-auto md:hidden">
              {items.map((item) => {
                const recipient = formatRecipient(item)
                return (
                  <li key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
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
                      <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
                    ) : null}
                    {recipient ? (
                      <p className="mt-1 text-sm text-muted-foreground">Entregado a: {recipient}</p>
                    ) : null}
                  </li>
                )
              })}
            </ul>

            {/* Desktop table */}
            <div className="hidden max-h-[min(70vh,560px)] overflow-auto rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
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
                      <TableCell className="max-w-[260px] truncate">
                        {formatRecipient(item) || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : null}

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
