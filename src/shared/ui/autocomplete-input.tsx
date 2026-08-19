import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"

interface AutocompleteInputProps {
  id?: string
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  icon?: LucideIcon
}

export function AutocompleteInput({
  id,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
  icon,
}: AutocompleteInputProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = value.trim().toLowerCase()
    if (!term) return options.slice(0, 8)
    return options
      .filter((option) => option.toLowerCase().includes(term))
      .slice(0, 8)
  }, [options, value])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <Input
        id={id}
        icon={icon}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false)
        }}
      />

      {open && filtered.length > 0 ? (
        <ul
          id={listId}
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-card p-1 shadow-md"
          role="listbox"
        >
          {filtered.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={cn(
                  "flex w-full rounded-sm px-3 py-2 text-left text-sm hover:bg-accent",
                  value === option && "bg-accent",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
