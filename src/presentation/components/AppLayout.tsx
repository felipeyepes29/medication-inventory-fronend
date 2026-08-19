import { NavLink, Outlet } from "react-router-dom"
import { Building2, Globe, History, Menu, Package, Tags, Users } from "lucide-react"
import { SiteFooter } from "@/presentation/components/SiteFooter"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { UserMenu } from "@/presentation/components/UserMenu"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  )

const menuLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
    isActive ? "bg-accent text-accent-foreground" : "text-foreground",
  )

export function AppLayout() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"

  const navItems = [
    { to: "/app", end: true, icon: Package, label: "Inventario" },
    { to: "/app/historial", end: false, icon: History, label: "Historial" },
    { to: "/app/marcas", end: false, icon: Tags, label: "Marcas" },
    ...(isSuperAdmin
      ? [
          { to: "/app/sedes", end: false, icon: Building2, label: "Sedes" },
          { to: "/app/usuarios", end: false, icon: Users, label: "Usuarios" },
        ]
      : []),
    { to: "/", end: true, icon: Globe, label: "Catálogo global" },
  ]

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "var(--page-gradient)" }}>
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-2 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Abrir menú de navegación"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.to} asChild>
                    <NavLink to={item.to} end={item.end} className={menuLinkClass}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <nav className="hidden min-w-0 flex-wrap items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1">
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
