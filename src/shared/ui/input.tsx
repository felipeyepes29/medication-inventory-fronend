import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, ...props }, ref) => {
    const input = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-9",
          className,
        )}
        ref={ref}
        {...props}
      />
    )

    if (!Icon) return input

    return (
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        {input}
      </div>
    )
  },
)
Input.displayName = "Input"
