import type { Medication } from "@/domain/entities/medication"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

function formatExpiration(value: string | null): string {
  if (!value) return "Sin fecha"
  const date = new Date(`${value}T00:00:00`)
  return date.toLocaleDateString("es-CO", { month: "2-digit", year: "numeric" })
}

function expirationBadge(value: string | null) {
  if (!value) {
    return <Badge variant="secondary">Sin fecha</Badge>
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiration = new Date(`${value}T00:00:00`)
  const soon = new Date(today)
  soon.setDate(soon.getDate() + 90)

  if (expiration < today) {
    return <Badge variant="danger">{formatExpiration(value)}</Badge>
  }
  if (expiration <= soon) {
    return <Badge variant="warning">{formatExpiration(value)}</Badge>
  }
  return <Badge variant="success">{formatExpiration(value)}</Badge>
}

interface InventoryTableProps {
  items: Medication[]
  loading: boolean
  onEdit: (medication: Medication) => void
  onDelete: (medication: Medication) => void
  onStockIn: (medication: Medication) => void
  onStockOut: (medication: Medication) => void
  onHistory: (medication: Medication) => void
}

export function InventoryTable({
  items,
  loading,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
  onHistory,
}: InventoryTableProps) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Cargando inventario...</p>
  }

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No hay medicamentos.</p>
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicamento</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Concentración</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.concentration}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{expirationBadge(item.expirationDate)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onStockIn(item)}>
                    Entrada
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onStockOut(item)}
                    disabled={item.quantity <= 0}
                  >
                    Salida
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onHistory(item)}>
                    Historial
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(item)}
                  >
                    Eliminar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
