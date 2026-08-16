import { useCallback, useEffect, useState } from "react"
import { brandUseCases } from "@/application/composition"
import type { Brand } from "@/domain/entities/brand"
import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

interface BrandsPageProps {
  onBack: () => void
}

export function BrandsPage({ onBack }: BrandsPageProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Brand | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setBrands(await brandUseCases.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las marcas")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setName(brand.name)
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const trimmed = name.trim()
      if (!trimmed) throw new Error("El nombre es obligatorio")
      if (editing) {
        await brandUseCases.update(editing.id, { name: trimmed })
      } else {
        await brandUseCases.create({ name: trimmed })
      }
      setFormOpen(false)
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    setError(null)
    try {
      await brandUseCases.delete(deleting.id)
      setDeleting(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar")
      setDeleting(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundImage: "var(--page-gradient)" }}>
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Medicine Inventory
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Marcas</h1>
            <p className="text-muted-foreground">
              {brands.length} marca{brands.length === 1 ? "" : "s"} registradas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Volver al inventario
            </Button>
            <Button type="button" onClick={openCreate}>
              Agregar marca
            </Button>
          </div>
        </header>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="rounded-lg border bg-card">
          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Cargando marcas...</p>
          ) : brands.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No hay marcas.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-44 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEdit(brand)}>
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleting(brand)}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar marca" : "Agregar marca"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Si renombras una marca, se actualiza en los medicamentos que la usan."
                : "La marca quedará disponible para seleccionar en crear/editar medicamentos."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="brand-name">Nombre</Label>
            <Input
              id="brand-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej. GENFAR"
            />
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar marca</DialogTitle>
            <DialogDescription>
              ¿Eliminar {deleting?.name}? Solo se puede si ningún medicamento la usa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleDelete()}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
