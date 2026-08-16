import { useEffect, useState, type FormEvent } from "react"
import { brandUseCases, medicationUseCases } from "@/application/composition"
import type { Medication, MedicationInput } from "@/domain/entities/medication"
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
import { SearchSelect } from "@/shared/ui/search-select"

interface MedicationFormDialogProps {
  open: boolean
  medication: Medication | null
  onOpenChange: (open: boolean) => void
  onSubmit: (input: MedicationInput) => Promise<void>
}

interface FormState {
  position: string
  name: string
  quantity: string
  concentration: string
  brand: string
  box: string
  month: string
  year: string
}

const emptyForm: FormState = {
  position: "",
  name: "",
  quantity: "",
  concentration: "",
  brand: "",
  box: "",
  month: "",
  year: "",
}

function splitExpiration(value: string | null): { month: string; year: string } {
  if (!value) return { month: "", year: "" }
  const [year, month] = value.slice(0, 7).split("-")
  return { month: month ?? "", year: year ?? "" }
}

function buildExpirationDate(month: string, year: string): string | null {
  const monthValue = month.trim()
  const yearValue = year.trim()

  if (!monthValue && !yearValue) return null

  if (!/^\d{1,2}$/.test(monthValue) || !/^\d{4}$/.test(yearValue)) {
    throw new Error("Usa mes (MM) y año (AAAA), por ejemplo 09 y 2028")
  }

  const monthNumber = Number(monthValue)
  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error("El mes debe estar entre 01 y 12")
  }

  return `${yearValue}-${String(monthNumber).padStart(2, "0")}-01`
}

export function MedicationFormDialog({
  open,
  medication,
  onOpenChange,
  onSubmit,
}: MedicationFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [brandOptions, setBrandOptions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false

    const loadForm = async () => {
      setError(null)
      try {
        const brands = await brandUseCases.list()
        if (!cancelled) {
          setBrandOptions(brands.map((item) => item.name))
        }
      } catch {
        if (!cancelled) setBrandOptions([])
      }

      if (medication) {
        const { month, year } = splitExpiration(medication.expirationDate)
        if (!cancelled) {
          setForm({
            position: String(medication.position),
            name: medication.name,
            quantity: String(medication.quantity),
            concentration: medication.concentration,
            brand: medication.brand,
            box: medication.box ?? "",
            month,
            year,
          })
        }
        return
      }

      if (!cancelled) setForm(emptyForm)
      try {
        const nextPosition = await medicationUseCases.getNextPosition()
        if (!cancelled) {
          setForm((prev) => ({ ...prev, position: String(nextPosition) }))
        }
      } catch {
        if (!cancelled) {
          setForm((prev) => ({ ...prev, position: "1" }))
        }
      }
    }

    void loadForm()
    return () => {
      cancelled = true
    }
  }, [medication, open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const position = Number(form.position)
      if (!Number.isInteger(position) || position < 1) {
        throw new Error("La posición debe ser un número entero mayor o igual a 1")
      }

      if (!form.brand.trim()) {
        throw new Error("Selecciona una marca")
      }

      const quantity = Number(form.quantity)
      if (!Number.isFinite(quantity) || quantity < 0) {
        throw new Error("La cantidad debe ser un número válido")
      }

      const box = form.box.trim()

      await onSubmit({
        position,
        name: form.name.trim(),
        quantity,
        concentration: form.concentration.trim(),
        brand: form.brand.trim(),
        box: box || null,
        expirationDate: buildExpirationDate(form.month, form.year),
      })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{medication ? "Editar medicamento" : "Agregar medicamento"}</DialogTitle>
          <DialogDescription>
            {medication
              ? "Actualiza los datos del medicamento. El stock se cambia con Entrada/Salida."
              : "Completa los datos del inventario. La cantidad inicial se registra como entrada."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="position">Posición</Label>
              <Input
                id="position"
                type="number"
                min={1}
                required
                placeholder="Ej. 1"
                value={form.position}
                onChange={(event) => setForm((prev) => ({ ...prev, position: event.target.value }))}
              />
              {!medication ? (
                <p className="text-xs text-muted-foreground">
                  Se sugiere la siguiente automáticamente; puedes cambiarla.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                required={!medication}
                disabled={Boolean(medication)}
                placeholder="Ej. 30"
                value={form.quantity}
                onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
              />
              {medication ? (
                <p className="text-xs text-muted-foreground">
                  Usa Entrada o Salida en la tabla para cambiar el stock.
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Medicamento</Label>
            <Input
              id="name"
              required
              placeholder="Ej. AMLODIPINO"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="concentration">Concentración</Label>
              <Input
                id="concentration"
                required
                placeholder="Ej. 50MG"
                value={form.concentration}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, concentration: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="box">Caja</Label>
              <Input
                id="box"
                placeholder="Ej. 2"
                value={form.box}
                onChange={(event) => setForm((prev) => ({ ...prev, box: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Opcional</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand">Marca</Label>
            <SearchSelect
              id="brand"
              options={brandOptions}
              value={form.brand}
              onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
              placeholder="Buscar y seleccionar marca"
              emptyText="No hay marcas. Agrégalas en Marcas."
            />
          </div>

          <div className="grid gap-2">
            <Label>Fecha de vencimiento</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="expiration-month"
                inputMode="numeric"
                maxLength={2}
                placeholder="MM"
                value={form.month}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    month: event.target.value.replace(/\D/g, "").slice(0, 2),
                  }))
                }
              />
              <Input
                id="expiration-year"
                inputMode="numeric"
                maxLength={4}
                placeholder="AAAA"
                value={form.year}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    year: event.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">Opcional. Ejemplo: 09 / 2028</p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
