import { useEffect, useState } from "react"
import { stockMovementUseCases } from "@/application/composition"
import type { Medication } from "@/domain/entities/medication"
import type { StockMovement } from "@/domain/entities/stock-movement"
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
      <DialogContent className="max-w-3xl">
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
          <div className="max-h-[420px] overflow-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
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
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
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
                    <TableCell className="max-w-[180px] truncate">
                      {item.note || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
