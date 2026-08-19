import { getRecipientDetails, type StockMovement } from "@/domain/entities/stock-movement"
import { cn } from "@/shared/lib/utils"

const ROWS = [
  { key: "name", label: "Nombre" },
  { key: "document", label: "Documento" },
  { key: "birthCity", label: "Ciudad de nacimiento" },
  { key: "birthDate", label: "Fecha de nacimiento" },
] as const

interface RecipientInfoProps {
  item: StockMovement
  labeled?: boolean
}

export function RecipientInfo({ item, labeled = false }: RecipientInfoProps) {
  const details = getRecipientDetails(item)

  if (!details) {
    if (labeled) return null
    return <span className="text-muted-foreground">—</span>
  }

  const list = (
    <dl className="flex min-w-0 flex-col gap-1">
      {ROWS.map(({ key, label }) => {
        const value = details[key]
        if (!value) return null
        return (
          <div key={key} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </dt>
            <dd className="break-words text-sm leading-snug text-foreground">{value}</dd>
          </div>
        )
      })}
    </dl>
  )

  if (!labeled) return list

  return (
    <div className={cn("mt-2 min-w-0 border-t pt-2")}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Entregado a
      </p>
      {list}
    </div>
  )
}
