import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, Building2, Pencil, Plus, Save, Tag, Trash2 } from "lucide-react"
import { Link } from "react-router-dom"
import { brandUseCases } from "@/application/composition"
import type { Site } from "@/domain/entities/auth"
import type { Brand } from "@/domain/entities/brand"
import { listSites } from "@/infrastructure/repositories/http-site-repository"
import { useAuth } from "@/presentation/hooks/useAuth"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

export function BrandsPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === "super_admin"
  const [brands, setBrands] = useState<Brand[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [siteFilter, setSiteFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Brand | null>(null)
  const [name, setName] = useState("")
  const [formSiteId, setFormSiteId] = useState("")
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Brand | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const siteId = siteFilter === "all" ? undefined : Number(siteFilter)
      const [brandResult, siteResult] = await Promise.all([
        brandUseCases.list(siteId),
        isSuperAdmin ? listSites({ includeInactive: true }) : Promise.resolve([]),
      ])
      setBrands(brandResult)
      if (isSuperAdmin) setSites(siteResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las marcas")
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin, siteFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openCreate = () => {
    setEditing(null)
    setName("")
    setFormSiteId(siteFilter === "all" ? "" : siteFilter)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (brand: Brand) => {
    setEditing(brand)
    setName(brand.name)
    setFormSiteId(String(brand.siteId))
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
        if (isSuperAdmin && !formSiteId) {
          throw new Error("Selecciona una sede")
        }
        await brandUseCases.create({
          name: trimmed,
          siteId: formSiteId ? Number(formSiteId) : null,
        })
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
    <main>
      <div className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Medicine Inventory
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Marcas</h1>
            <p className="text-muted-foreground">
              {brands.length} marca{brands.length === 1 ? "" : "s"} de esta sede
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin ? (
              <div className="w-56">
                <Select value={siteFilter} onValueChange={setSiteFilter}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Sede" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las sedes</SelectItem>
                    {sites.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <Button asChild type="button" variant="outline">
              <Link to="/app">
                <ArrowLeft className="h-4 w-4" />
                Volver al inventario
              </Link>
            </Button>
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
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
                  {isSuperAdmin ? <TableHead>Sede</TableHead> : null}
                  <TableHead className="w-[1%] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    {isSuperAdmin ? (
                      <TableCell className="text-muted-foreground">{brand.siteName ?? "—"}</TableCell>
                    ) : null}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(brand)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleting(brand)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
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
                : "La marca solo existirá en la sede elegida."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {isSuperAdmin && !editing ? (
              <div className="grid gap-2">
                <Label>Sede</Label>
                <Select value={formSiteId} onValueChange={setFormSiteId}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Elige una sede" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.filter((item) => item.isActive).map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="brand-name">Nombre</Label>
              <Input
                id="brand-name"
                icon={Tag}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. GENFAR"
              />
            </div>
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleSave()}>
              <Save className="h-4 w-4" />
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
              ¿Eliminar {deleting?.name}? Solo se puede si ningún medicamento de esta sede la usa.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button type="button" disabled={saving} onClick={() => void handleDelete()}>
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
