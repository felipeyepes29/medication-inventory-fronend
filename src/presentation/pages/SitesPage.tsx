import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, Building2, MapPin, Pencil, Plus, Save } from "lucide-react"
import { Link } from "react-router-dom"
import type { Site } from "@/domain/entities/auth"
import {
  createSite,
  listSites,
  updateSite,
} from "@/infrastructure/repositories/http-site-repository"
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
import { Checkbox } from "@/shared/ui/checkbox"
import { Separator } from "@/shared/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

export function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Site | null>(null)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSites(await listSites({ includeInactive: true }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las sedes")
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
    setAddress("")
    setIsActive(true)
    setIsPublic(false)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (site: Site) => {
    setEditing(site)
    setName(site.name)
    setAddress(site.address ?? "")
    setIsActive(site.isActive)
    setIsPublic(site.isPublic)
    setFormError(null)
    setFormOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      const trimmed = name.trim()
      if (!trimmed) throw new Error("El nombre es obligatorio")
      const payload = {
        name: trimmed,
        address: address.trim() || null,
        isActive,
        isPublic,
      }
      if (editing) {
        await updateSite(editing.id, payload)
      } else {
        await createSite(payload)
      }
      setFormOpen(false)
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sedes</h1>
          <p className="text-muted-foreground">
            {sites.length} sede{sites.length === 1 ? "" : "s"}. Los centros no pueden crear otras sedes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild type="button" variant="outline">
            <Link to="/app">
              <ArrowLeft className="h-4 w-4" />
              Volver al inventario
            </Link>
          </Button>
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Agregar sede
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
          <p className="py-10 text-center text-sm text-muted-foreground">Cargando sedes...</p>
        ) : sites.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay sedes.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Catálogo público</TableHead>
                <TableHead className="w-36 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell className="text-muted-foreground">{site.address || "—"}</TableCell>
                  <TableCell>{site.isActive ? "Activa" : "Inactiva"}</TableCell>
                  <TableCell>{site.isPublic ? "Visible" : "Privada"}</TableCell>
                  <TableCell className="text-right">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(site)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar sede" : "Agregar sede"}</DialogTitle>
            <DialogDescription>
              Las sedes nuevas empiezan vacías y privadas. El inventario actual de Casa de la Cultura sigue visible en el buscador.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="site-name">Nombre</Label>
              <Input
                id="site-name"
                icon={Building2}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Fundación Casa de la Cultura"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="site-address">Dirección (opcional)</Label>
              <Input
                id="site-address"
                icon={MapPin}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Calle, barrio, ciudad"
              />
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <Checkbox
                id="site-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked === true)}
              />
              <Label htmlFor="site-active" className="cursor-pointer font-normal">
                Sede activa
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="site-public"
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(checked === true)}
              />
              <Label htmlFor="site-public" className="cursor-pointer font-normal">
                Visible en el catálogo público
              </Label>
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
    </main>
  )
}
