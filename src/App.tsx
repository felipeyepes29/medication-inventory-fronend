import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import type { ReactNode } from "react"
import { AppLayout } from "@/presentation/components/AppLayout"
import { useAuth } from "@/presentation/hooks/useAuth"
import { BrandsPage } from "@/presentation/pages/BrandsPage"
import { HistoryPage } from "@/presentation/pages/HistoryPage"
import { InventoryPage } from "@/presentation/pages/InventoryPage"
import { LoginPage } from "@/presentation/pages/LoginPage"
import { SitesPage } from "@/presentation/pages/SitesPage"
import { TermsPage } from "@/presentation/pages/TermsPage"
import { UsersPage } from "@/presentation/pages/UsersPage"

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Verificando acceso...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function RequireSuperAdmin() {
  const { user } = useAuth()
  if (user?.role !== "super_admin") {
    return <Navigate to="/app" replace />
  }
  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<InventoryPage mode="public" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/terminos" element={<TermsPage />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<InventoryPage mode="manage" />} />
        <Route path="marcas" element={<BrandsPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route element={<RequireSuperAdmin />}>
          <Route path="sedes" element={<SitesPage />} />
          <Route path="usuarios" element={<UsersPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
