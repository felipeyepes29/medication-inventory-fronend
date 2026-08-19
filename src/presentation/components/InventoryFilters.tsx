import { useMemo, useState } from "react"
import {
  Box,
  Building2,
  CalendarClock,
  ChevronDown,
  FilterX,
  Search,
  SlidersHorizontal,
  Tag,
} from "lucide-react"
import type { ExpirationStatus } from "@/domain/entities/medication"
import { cn } from "@/shared/lib/utils"
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
  box: string
  boxes: string[]
  onBoxChange: (value: string) => void
  expirationStatus: ExpirationStatus
  onExpirationStatusChange: (value: ExpirationStatus) => void
  onClear: () => void
  siteId?: string
  sites?: { id: number; name: string }[]
  onSiteChange?: (value: string) => void
  showBox?: boolean
}

export function InventoryFilters({
  q,
  onQChange,
  brand,
  brands,
  onBrandChange,
  box,
  boxes,
  onBoxChange,
  expirationStatus,
  onExpirationStatusChange,
  onClear,
  siteId,
  sites,
  onSiteChange,
  showBox = true,
}: InventoryFiltersProps) {
  const showSites = Boolean(sites && onSiteChange && siteId !== undefined)
  const activeCount = useMemo(() => {
    let count = 0
    if (q.trim()) count += 1
    if (brand !== "all") count += 1
    if (showBox && box !== "all") count += 1
    if (expirationStatus !== "all") count += 1
    if (showSites && siteId !== "all") count += 1
    return count
  }, [brand, box, expirationStatus, q, showBox, showSites, siteId])

  const [open, setOpen] = useState(activeCount > 0)

  return (
    <aside className="h-fit min-w-0 self-start overflow-hidden rounded-xl border bg-card/90 shadow-sm backdrop-blur">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left lg:cursor-default lg:px-5 lg:pb-0 lg:pt-5"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="text-base font-semibold text-foreground">Filtros</h2>
            {activeCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {activeCount}
              </span>
            ) : null}
          </div>
          <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
            Refina por nombre, marca{showBox ? ", caja" : ""}, sede o vencimiento.
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform lg:hidden",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid gap-4 px-4 pb-4 pt-3 lg:grid lg:px-5 lg:pb-5 lg:pt-4",
          open ? "grid" : "hidden lg:grid",
        )}
      >
        <div className="min-w-0 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="search">
            Buscar
          </label>
          <Input
            id="search"
            icon={Search}
            className="min-w-0"
            placeholder="Nombre, marca..."
            value={q}
            onChange={(event) => onQChange(event.target.value)}
          />
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="min-w-0 space-y-1.5">
            <span className="text-sm font-medium text-muted-foreground">Marca</span>
            <Select value={brand} onValueChange={onBrandChange}>
              <SelectTrigger className="min-w-0">
                <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Todas" />
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

          {showSites ? (
            <div className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Sede</span>
              <Select value={siteId} onValueChange={onSiteChange}>
                <SelectTrigger className="min-w-0">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {sites?.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {showBox ? (
            <div className="min-w-0 space-y-1.5">
              <span className="text-sm font-medium text-muted-foreground">Caja</span>
              <Select value={box} onValueChange={onBoxChange}>
                <SelectTrigger className="min-w-0">
                  <Box className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {boxes.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="min-w-0 space-y-1.5 sm:col-span-2 lg:col-span-1">
            <span className="text-sm font-medium text-muted-foreground">Vencimiento</span>
            <Select
              value={expirationStatus}
              onValueChange={(value) => onExpirationStatusChange(value as ExpirationStatus)}
            >
              <SelectTrigger className="min-w-0">
                <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
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
          <FilterX className="h-4 w-4" />
          Limpiar filtros
        </Button>
      </div>
    </aside>
  )
}
