import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpDown,
  ArrowUpFromLine,
  History,
  Pencil,
  Settings2,
  Trash2,
} from "lucide-react"
import type { ReactNode } from "react"
import type { Medication, SortField, SortOrder } from "@/domain/entities/medication"
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

function availabilityBadge(quantity: number) {
  if (quantity > 0) {
    return <Badge variant="success">Disponible</Badge>
  }
  return <Badge variant="danger">Agotado</Badge>
}

interface InventoryTableProps {
  items: Medication[]
  loading: boolean
  sortBy: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  readOnly?: boolean
  showSite?: boolean
  onEdit?: (medication: Medication) => void
  onDelete?: (medication: Medication) => void
  onStockIn?: (medication: Medication) => void
  onStockOut?: (medication: Medication) => void
  onHistory?: (medication: Medication) => void
}

function SortableHead({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  className,
}: {
  label: string
  field: SortField
  sortBy: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  className?: string
}) {
  const active = sortBy === field
  return (
    <TableHead className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1 font-medium hover:text-foreground"
        onClick={() => onSort(field)}
      >
        {label}
        {active ? (
          sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

function MedicationActions({
  item,
  onEdit,
  onDelete,
  onStockIn,
  onStockOut,
  onHistory,
}: {
  item: Medication
  onEdit: (medication: Medication) => void
  onDelete: (medication: Medication) => void
  onStockIn: (medication: Medication) => void
  onStockOut: (medication: Medication) => void
  onHistory: (medication: Medication) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full border border-border"
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
        <DropdownMenuItem disabled={item.quantity <= 0} onSelect={() => onStockOut(item)}>
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
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm text-foreground">{children}</dd>
    </div>
  )
}

export function InventoryTable({
  items,
  loading,
  sortBy,
  sortOrder,
  onSort,
  readOnly = false,
  showSite = false,
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

  const canAct = Boolean(onEdit && onDelete && onStockIn && onStockOut && onHistory)

  return (
    <>
      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs tabular-nums text-muted-foreground">Posición {item.position}</p>
                <h3 className="mt-0.5 text-base font-semibold leading-snug text-foreground">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.concentration} · {item.brand}
                </p>
              </div>
              {!readOnly && canAct ? (
                <MedicationActions
                  item={item}
                  onEdit={onEdit!}
                  onDelete={onDelete!}
                  onStockIn={onStockIn!}
                  onStockOut={onStockOut!}
                  onHistory={onHistory!}
                />
              ) : null}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3">
              {showSite ? (
                <Field label="Sede">{item.siteName ?? "—"}</Field>
              ) : null}
              <Field label={readOnly ? "Disponibilidad" : "Cantidad"}>
                {readOnly ? availabilityBadge(item.quantity) : item.quantity}
              </Field>
              <Field label="Caja">{item.box ?? "—"}</Field>
              <div className="col-span-2 min-w-0">
                <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Vencimiento
                </dt>
                <dd className="mt-1">{expirationBadge(item.expirationDate)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label="Posición"
                field="position"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
                className="w-28"
              />
              <TableHead>Medicamento</TableHead>
              {showSite ? <TableHead>Sede</TableHead> : null}
              <SortableHead
                label={readOnly ? "Disponibilidad" : "Cantidad"}
                field="quantity"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <TableHead>Concentración</TableHead>
              <TableHead>Marca</TableHead>
              <SortableHead
                label="Caja"
                field="box"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              <TableHead>Vencimiento</TableHead>
              {!readOnly ? <TableHead className="w-16 text-center">Acciones</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="tabular-nums text-muted-foreground">{item.position}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                {showSite ? (
                  <TableCell className="text-muted-foreground">{item.siteName ?? "—"}</TableCell>
                ) : null}
                <TableCell>
                  {readOnly ? availabilityBadge(item.quantity) : item.quantity}
                </TableCell>
                <TableCell>{item.concentration}</TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell className="text-muted-foreground">{item.box ?? "—"}</TableCell>
                <TableCell>{expirationBadge(item.expirationDate)}</TableCell>
                {!readOnly && canAct ? (
                  <TableCell className="p-2">
                    <div className="flex justify-center">
                      <MedicationActions
                        item={item}
                        onEdit={onEdit!}
                        onDelete={onDelete!}
                        onStockIn={onStockIn!}
                        onStockOut={onStockOut!}
                        onHistory={onHistory!}
                      />
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
