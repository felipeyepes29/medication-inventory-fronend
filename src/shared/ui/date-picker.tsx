import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

function parseLocalDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

interface DatePickerProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  fromYear?: number
  toDate?: Date
  className?: string
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  fromYear = 1920,
  toDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = parseLocalDate(value)
  const today = toDate ?? undefined
  const startMonth = new Date(fromYear, 0)
  const endMonth = today ? new Date(today.getFullYear(), today.getMonth()) : undefined

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          data-empty={!selected}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {selected ? format(selected, "PPP", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={today ? { after: today } : undefined}
          onSelect={(date) => {
            onChange(date ? toIsoDate(date) : "")
            if (date) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
