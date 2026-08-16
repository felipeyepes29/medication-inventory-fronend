import { AuthGate } from "@/presentation/components/AuthGate"
import { BrandsPage } from "@/presentation/pages/BrandsPage"
import { InventoryPage } from "@/presentation/pages/InventoryPage"
import { useState } from "react"

type AppView = "inventory" | "brands"

function App() {
  const [view, setView] = useState<AppView>("inventory")

  return (
    <AuthGate>
      {view === "brands" ? (
        <BrandsPage onBack={() => setView("inventory")} />
      ) : (
        <InventoryPage onOpenBrands={() => setView("brands")} />
      )}
    </AuthGate>
  )
}

export default App
