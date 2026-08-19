import { ArrowDownToLine, ArrowUpFromLine, Hash, IdCard, MapPin, StickyNote, User } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import type { Medication } from "@/domain/entities/medication"
import {
  DOCUMENT_TYPES,
  type MovementType,
  type StockMovementInput,
} from "@/domain/entities/stock-movement"
import { Button } from "@/shared/ui/button"
import { DatePicker } from "@/shared/ui/date-picker"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"

interface StockMovementDialogProps {
  open: boolean
  medication: Medication | null
  movementType: MovementType
  onOpenChange: (open: boolean) => void
  onSubmit: (input: StockMovementInput) => Promise<void>
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
  const [documentType, setDocumentType] = useState("none")
  const [identityDocument, setIdentityDocument] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthCity, setBirthCity] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isOut = movementType === "out"
  const title = isOut ? "Registrar salida" : "Registrar entrada"
  const description = isOut
    ? "Descuenta unidades del inventario. Si quieres, registra a quién se le entregó."
    : "Suma unidades al inventario y deja registro de lo que llegó."

  useEffect(() => {
    if (!open) return
    setQuantity("")
    setNote("")
    setDocumentType("none")
    setIdentityDocument("")
    setFirstName("")
    setLastName("")
    setBirthCity("")
    setBirthDate("")
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
        documentType: isOut && documentType !== "none" ? documentType : null,
        identityDocument: isOut ? identityDocument.trim() || null : null,
        firstName: isOut ? firstName.trim() || null : null,
        lastName: isOut ? lastName.trim() || null : null,
        birthCity: isOut ? birthCity.trim() || null : null,
        birthDate: isOut ? birthDate || null : null,
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              icon={Hash}
              type="number"
              min={1}
              required
              placeholder={isOut ? "Ej. 2" : "Ej. 30"}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>

          {isOut ? (
            <>
              <Separator />
              <div className="grid gap-3">
                <div>
                  <p className="text-sm font-medium">Datos de quien recibe</p>
                  <p className="text-xs text-muted-foreground">Opcional. Sirve para saber a quién se entregó.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="recipient-first-name">Nombres</Label>
                    <Input
                      id="recipient-first-name"
                      icon={User}
                      autoComplete="given-name"
                      placeholder="Ej. Ana María"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recipient-last-name">Apellidos</Label>
                    <Input
                      id="recipient-last-name"
                      icon={User}
                      autoComplete="family-name"
                      placeholder="Ej. Gómez Pérez"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Tipo de documento</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <IdCard className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="Sin especificar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {DOCUMENT_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.value} — {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipient-document">Documento de identidad</Label>
                  <Input
                    id="recipient-document"
                    icon={IdCard}
                    inputMode="numeric"
                    placeholder="Ej. 1023456789"
                    value={identityDocument}
                    onChange={(event) => setIdentityDocument(event.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="recipient-city">Ciudad de nacimiento</Label>
                    <Input
                      id="recipient-city"
                      icon={MapPin}
                      placeholder="Ej. Bogotá"
                      value={birthCity}
                      onChange={(event) => setBirthCity(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="recipient-birthdate">Fecha de nacimiento</Label>
                    <DatePicker
                      id="recipient-birthdate"
                      value={birthDate}
                      onChange={setBirthDate}
                      placeholder="Selecciona una fecha"
                      toDate={new Date()}
                    />
                  </div>
                </div>
              </div>
              <Separator />
            </>
          ) : null}

          <div className="grid gap-2">
            <Label htmlFor="movement-note">Nota (opcional)</Label>
            <Input
              id="movement-note"
              icon={StickyNote}
              placeholder={isOut ? "Ej. Entrega a usuario" : "Ej. Compra farmacia"}
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
              {isOut ? <ArrowUpFromLine className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />}
              {saving ? "Guardando..." : isOut ? "Descontar" : "Agregar stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
