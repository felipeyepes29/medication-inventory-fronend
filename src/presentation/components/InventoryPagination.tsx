import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PageSizeOption } from "@/presentation/hooks/useMedications"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"

interface InventoryPaginationProps {
  page: number
  totalPages: number
  total: number
  pageSizeOption: PageSizeOption
  onPageChange: (page: number) => void
  onPageSizeChange: (value: PageSizeOption) => void
}

function rangeLabel(page: number, pageSizeOption: PageSizeOption, total: number): string {
  if (total === 0) return "0 de 0"
  if (pageSizeOption === "all") return `1-${total} de ${total}`
  const start = (page - 1) * pageSizeOption + 1
  const end = Math.min(page * pageSizeOption, total)
  return `${start}-${end} de ${total}`
}

function buildPageItems(current: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, current])
  for (let offset = 1; offset <= 1; offset += 1) {
    pages.add(current - offset)
    pages.add(current + offset)
  }

  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b)
  const items: Array<number | "ellipsis"> = []

  for (let index = 0; index < sorted.length; index += 1) {
    const value = sorted[index]
    const previous = sorted[index - 1]
    if (previous !== undefined && value - previous > 1) {
      items.push("ellipsis")
    }
    items.push(value)
  }

  return items
}

export function InventoryPagination({
  page,
  totalPages,
  total,
  pageSizeOption,
  onPageChange,
  onPageSizeChange,
}: InventoryPaginationProps) {
  const pageItems = pageSizeOption === "all" ? [] : buildPageItems(page, totalPages)

  return (
    <div className="flex min-w-0 flex-col gap-3 overflow-hidden rounded-lg border bg-card px-3 py-3 sm:px-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="truncate text-sm text-muted-foreground">
        {rangeLabel(page, pageSizeOption, total)}
      </p>

      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Mostrar</span>
          <Select
            value={String(pageSizeOption)}
            onValueChange={(value) => {
              if (value === "all") {
                onPageSizeChange("all")
                return
              }
              onPageSizeChange(Number(value) as 20 | 30 | 50 | 100)
            }}
          >
            <SelectTrigger className="w-[110px] shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-start">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={page <= 1 || pageSizeOption === "all"}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {pageSizeOption === "all" ? (
            <span className="px-2 text-sm text-muted-foreground">Todo</span>
          ) : (
            <>
              <span className="px-1 text-sm tabular-nums text-muted-foreground sm:hidden">
                {page}/{totalPages}
              </span>
              <div className="hidden flex-wrap items-center gap-1 sm:flex">
                {pageItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-sm text-muted-foreground"
                      aria-hidden
                    >
                      …
                    </span>
                  ) : (
                    <Button
                      key={item}
                      type="button"
                      size="sm"
                      variant={item === page ? "default" : "outline"}
                      className="min-w-9"
                      aria-current={item === page ? "page" : undefined}
                      onClick={() => onPageChange(item)}
                    >
                      {item}
                    </Button>
                  ),
                )}
              </div>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled={page >= totalPages || pageSizeOption === "all"}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
