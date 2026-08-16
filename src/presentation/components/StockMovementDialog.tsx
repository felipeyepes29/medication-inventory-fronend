import { useEffect, useState, type FormEvent } from "react"
import type { Medication } from "@/domain/entities/medication"
import type { MovementType } from "@/domain/entities/stock-movement"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

interface StockMovementDialogProps {
  open: boolean
  medication: Medication | null
  movementType: MovementType
  onOpenChange: (open: boolean) => void
  onSubmit: (input: {
    movementType: MovementType
    quantity: number
    note: string | null
  }) => Promise<void>
}

export function StockMovementDialog({
  open,
  medication,
  movementType,
  onOpenChange,
  onSubmit,
}: StockMovementDialogProps) {
  const [quantity, setQuantity] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOut = movementType === "out"
  const title = isOut ? "Registrar salida" : "Registrar entrada"
  const description = isOut
    ? "Descuenta unidades del inventario y deja registro de lo que se usó."
    : "Suma unidades al inventario y deja registro de lo que llegó."

  useEffect(() => {
    if (!open) return
    setQuantity("")
    setNote("")
    setError(null)
  }, [open, movementType, medication?.id])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const value = Number(quantity)
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error("Ingresa una cantidad mayor a 0")
      }
      if (isOut && medication && value > medication.quantity) {
        throw new Error(`Solo hay ${medication.quantity} unidad(es) disponibles`)
      }
      await onSubmit({
        movementType,
        quantity: value,
        note: note.trim() || null,
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el movimiento")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
            {medication ? (
              <>
                {" "}
                Medicamento: <strong>{medication.name}</strong> (stock actual:{" "}
                {medication.quantity}).
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="movement-quantity">Cantidad</Label>
            <Input
              id="movement-quantity"
              type="number"
              min={1}
              required
              placeholder={isOut ? "Ej. 2" : "Ej. 30"}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="movement-note">Nota (opcional)</Label>
            <Input
              id="movement-note"
              placeholder={isOut ? "Ej. Consumo diario" : "Ej. Compra farmacia"}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} variant={isOut ? "destructive" : "default"}>
              {saving ? "Guardando..." : isOut ? "Descontar" : "Agregar stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
