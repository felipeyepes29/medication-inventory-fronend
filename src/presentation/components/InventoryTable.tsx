import { ArrowDownToLine, ArrowUpFromLine, History, Pencil, Settings2, Trash2 } from "lucide-react"
import type { Medication } from "@/domain/entities/medication"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
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
            <TableHead className="w-20">Posición</TableHead>
            <TableHead>Medicamento</TableHead>
            <TableHead>Cantidad</TableHead>
            <TableHead>Concentración</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead className="w-14 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="tabular-nums text-muted-foreground">{item.position}</TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.concentration}</TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{expirationBadge(item.expirationDate)}</TableCell>
              <TableCell className="p-2 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Acciones de ${item.name}`}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onStockIn(item)}>
                      <ArrowDownToLine className="h-4 w-4" />
                      Entrada
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={item.quantity <= 0}
                      onSelect={() => onStockOut(item)}
                    >
                      <ArrowUpFromLine className="h-4 w-4" />
                      Salida
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onHistory(item)}>
                      <History className="h-4 w-4" />
                      Historial
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => onEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      onSelect={() => onDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
