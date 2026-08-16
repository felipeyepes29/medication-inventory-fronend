import { AuthGate } from "@/presentation/components/AuthGate"
import { BrandsPage } from "@/presentation/pages/BrandsPage"
import { HistoryPage } from "@/presentation/pages/HistoryPage"
import { InventoryPage } from "@/presentation/pages/InventoryPage"
import { useState } from "react"

type AppView = "inventory" | "brands" | "history"

function App() {
  const [view, setView] = useState<AppView>("inventory")

  return (
    <AuthGate>
      {view === "brands" ? (
        <BrandsPage onBack={() => setView("inventory")} />
      ) : view === "history" ? (
        <HistoryPage onBack={() => setView("inventory")} />
      ) : (
        <InventoryPage
          onOpenBrands={() => setView("brands")}
          onOpenHistory={() => setView("history")}
        />
      )}
    </AuthGate>
  )
}

export default App
