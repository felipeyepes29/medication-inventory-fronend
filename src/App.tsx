import { AuthGate } from "@/presentation/components/AuthGate"
import { InventoryPage } from "@/presentation/pages/InventoryPage"

function App() {
  return (
    <AuthGate>
      <InventoryPage />
    </AuthGate>
  )
}

export default App
