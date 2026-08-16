import type { ExpirationStatus } from "@/domain/entities/medication"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface InventoryFiltersProps {
  q: string
  onQChange: (value: string) => void
  brand: string
  brands: string[]
  onBrandChange: (value: string) => void
  expirationStatus: ExpirationStatus
  onExpirationStatusChange: (value: ExpirationStatus) => void
  onClear: () => void
}

export function InventoryFilters({
  q,
  onQChange,
  brand,
  brands,
  onBrandChange,
  expirationStatus,
  onExpirationStatusChange,
  onClear,
}: InventoryFiltersProps) {
  return (
    <aside className="flex h-fit flex-col gap-5 rounded-xl border bg-card/90 p-5 shadow-sm backdrop-blur">
      <div>
        <h2 className="text-base font-semibold text-foreground">Filtros</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Refina el inventario por nombre, marca o vencimiento.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="search">
            Buscar
          </label>
          <Input
            id="search"
            placeholder="Nombre, marca o concentración..."
            value={q}
            onChange={(event) => onQChange(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">Marca</span>
          <Select value={brand} onValueChange={onBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {brands.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-muted-foreground">Vencimiento</span>
          <Select
            value={expirationStatus}
            onValueChange={(value) => onExpirationStatusChange(value as ExpirationStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="expiring_soon">Próximos 90 días</SelectItem>
              <SelectItem value="expired">Vencidos</SelectItem>
              <SelectItem value="no_date">Sin fecha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={onClear}>
        Limpiar filtros
      </Button>
    </aside>
  )
}
