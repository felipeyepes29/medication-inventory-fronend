import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"
import type { AuthUser } from "@/domain/entities/auth"
import { updateSiteVisibility } from "@/infrastructure/repositories/http-site-repository"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Label } from "@/shared/ui/label"
import { Switch } from "@/shared/ui/switch"

function displayName(user: AuthUser): string {
  if (user.siteName) return user.siteName
  return user.role === "super_admin" ? "Super admin" : "Usuario"
}

function initials(user: AuthUser): string {
  const skip = new Set(["de", "del", "la", "el", "los", "las", "y", "the"])
  const fromName = displayName(user)
    .split(/\s+/)
    .filter((word) => word.length > 1 && !skip.has(word.toLowerCase()))
  if (fromName.length >= 2) {
    return `${fromName[0][0] ?? ""}${fromName[1][0] ?? ""}`.toUpperCase()
  }
  if (fromName.length === 1 && fromName[0].length >= 2) {
    return fromName[0].slice(0, 2).toUpperCase()
  }
  const local = user.email.split("@")[0] ?? ""
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
  }
  return (local.slice(0, 2) || "?").toUpperCase()
}

export function UserMenu() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  const name = displayName(user)
  const letters = initials(user)
  const visible = Boolean(user.siteIsPublic)
  const canToggleCatalog = user.role === "site_user" && Boolean(user.siteId)

  const toggleCatalog = async (next: boolean) => {
    if (!user.siteId || next === visible) return
    setSaving(true)
    setError(null)
    try {
      await updateSiteVisibility(user.siteId, next)
      await refreshUser()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto gap-2 px-1.5 py-1"
          aria-label="Menú de usuario"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {letters}
          </span>
          <span className="min-w-0 text-left leading-tight">
            <span className="block max-w-[160px] truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className="block max-w-[160px] truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {canToggleCatalog ? (
          <>
            <DropdownMenuItem
              className="cursor-default justify-between gap-3"
              onSelect={(event) => event.preventDefault()}
            >
              <Label htmlFor="catalog-public" className="flex-1 cursor-pointer font-normal">
                Catálogo público
              </Label>
              <Switch
                id="catalog-public"
                checked={visible}
                disabled={saving}
                onCheckedChange={(checked) => void toggleCatalog(checked)}
                aria-label={visible ? "Ocultar catálogo público" : "Mostrar catálogo público"}
              />
            </DropdownMenuItem>
            {error ? <p className="px-2 pb-1 text-xs text-destructive">{error}</p> : null}
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            logout()
            navigate("/login")
          }}
        >
          <LogOut />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
