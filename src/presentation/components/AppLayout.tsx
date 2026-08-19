import { NavLink, Outlet } from "react-router-dom"
import { Building2, Globe, History, Package, Tags, Users } from "lucide-react"
import { SiteFooter } from "@/presentation/components/SiteFooter"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { UserMenu } from "@/presentation/components/UserMenu"
import { useAuth } from "@/presentation/hooks/useAuth"
import { cn } from "@/shared/lib/utils"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )

export function AppLayout() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "var(--page-gradient)" }}>
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <nav className="flex min-w-0 flex-wrap items-center gap-1">
            <NavLink to="/app" end className={linkClass}>
              <Package className="h-4 w-4" />
              Inventario
            </NavLink>
            <NavLink to="/app/historial" className={linkClass}>
              <History className="h-4 w-4" />
              Historial
            </NavLink>
            <NavLink to="/app/marcas" className={linkClass}>
              <Tags className="h-4 w-4" />
              Marcas
            </NavLink>
            {isSuperAdmin ? (
              <>
                <NavLink to="/app/sedes" className={linkClass}>
                  <Building2 className="h-4 w-4" />
                  Sedes
                </NavLink>
                <NavLink to="/app/usuarios" className={linkClass}>
                  <Users className="h-4 w-4" />
                  Usuarios
                </NavLink>
              </>
            ) : null}
            <NavLink to="/" className={linkClass}>
              <Globe className="h-4 w-4" />
              Catálogo global
            </NavLink>
          </nav>
          <div className="flex items-center justify-end gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
