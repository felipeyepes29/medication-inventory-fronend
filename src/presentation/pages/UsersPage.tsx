import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Building2, KeyRound, Mail, Pencil, Plus, Save, Settings2 } from "lucide-react"
import type { ManagedUser, Site, UserRole } from "@/domain/entities/auth"
import { listSites } from "@/infrastructure/repositories/http-site-repository"
import {
  changeUserPassword,
  createUser,
  listUsers,
  setUserActive,
  updateUser,
} from "@/infrastructure/repositories/http-user-repository"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { PasswordInput } from "@/shared/ui/password-input"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { Separator } from "@/shared/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ManagedUser | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("site_user")
  const [siteId, setSiteId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [savingPassword, setSavingPassword] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [userResult, siteResult] = await Promise.all([
        listUsers(),
        listSites({ includeInactive: true }),
      ])
      setUsers(userResult)
      setSites(siteResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const openCreate = () => {
    setEditing(null)
    setEmail("")
    setPassword("")
    setRole("site_user")
    setSiteId("")
    setIsActive(true)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (item: ManagedUser) => {
    setEditing(item)
    setEmail(item.email)
    setPassword("")
    setRole(item.role)
    setSiteId(item.siteId ? String(item.siteId) : "")
    setIsActive(item.isActive)
    setFormError(null)
    setFormOpen(true)
  }

  const openPassword = (item: ManagedUser) => {
    setPasswordUser(item)
    setNewPassword("")
    setPasswordError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setFormError(null)
    try {
      if (!email.trim()) throw new Error("El correo es obligatorio")
      if (!editing && password.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres")
      }
      if (role === "site_user" && !siteId) {
        throw new Error("El usuario de centro debe tener una sede")
      }
      const payload = {
        email: email.trim(),
        role,
        siteId: role === "super_admin" ? null : Number(siteId),
        isActive: editing ? editing.isActive : isActive,
      }
      if (editing) {
        await updateUser(editing.id, payload)
      } else {
        await createUser({ ...payload, password })
      }
      setFormOpen(false)
      await refresh()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (item: ManagedUser, next: boolean) => {
    if (currentUser?.id === item.id && !next) {
      setError("No puedes desactivar tu propia cuenta")
      return
    }
    setTogglingId(item.id)
    setError(null)
    const previous = users
    setUsers((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, isActive: next } : entry)),
    )
    try {
      await setUserActive(item, next)
    } catch (err) {
      setUsers(previous)
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado")
    } finally {
      setTogglingId(null)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordUser) return
    setSavingPassword(true)
    setPasswordError(null)
    try {
      if (newPassword.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres")
      }
      await changeUserPassword(passwordUser, newPassword)
      setPasswordUser(null)
      setNewPassword("")
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña")
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Solo el super admin crea cuentas. Cada usuario de centro gestiona una sede.
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
            Agregar usuario
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
          <p className="py-10 text-center text-sm text-muted-foreground">Cargando usuarios...</p>
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay usuarios.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Correo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((item) => {
                const isSelf = currentUser?.id === item.id
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.email}</TableCell>
                    <TableCell>
                      {item.role === "super_admin" ? "Super admin" : "Usuario de centro"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.siteName || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`user-active-${item.id}`}
                          checked={item.isActive}
                          disabled={togglingId === item.id || (isSelf && item.isActive)}
                          onCheckedChange={(checked) => void handleToggleActive(item, checked)}
                          aria-label={item.isActive ? "Desactivar usuario" : "Activar usuario"}
                        />
                        <Label
                          htmlFor={`user-active-${item.id}`}
                          className="cursor-pointer font-normal"
                        >
                          {item.isActive ? "Activo" : "Inactivo"}
                        </Label>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Acciones de ${item.email}`}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => openEdit(item)}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => openPassword(item)}>
                            <KeyRound className="h-4 w-4" />
                            Cambiar contraseña
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar usuario" : "Agregar usuario"}</DialogTitle>
            <DialogDescription>
              Un usuario de centro solo ve y edita el inventario de su sede.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="user-email">Correo</Label>
              <Input
                id="user-email"
                icon={Mail}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            {editing ? null : (
              <div className="grid gap-2">
                <Label htmlFor="user-password">Contraseña</Label>
                <PasswordInput
                  id="user-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}
            <Separator />
            <div className="grid gap-3">
              <Label>Rol</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => {
                  const next = value as UserRole
                  setRole(next)
                  if (next === "super_admin") setSiteId("")
                }}
                className="gap-3"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="site_user" id="role-site-user" />
                  <Label htmlFor="role-site-user" className="cursor-pointer font-normal">
                    Usuario de centro
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="super_admin" id="role-super-admin" />
                  <Label htmlFor="role-super-admin" className="cursor-pointer font-normal">
                    Super admin
                  </Label>
                </div>
              </RadioGroup>
            </div>
            {role === "site_user" ? (
              <div className="grid gap-2">
                <Label>Sede</Label>
                <Select value={siteId} onValueChange={setSiteId}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <SelectValue placeholder="Elige una sede" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites
                      .filter((item) => item.isActive || String(item.id) === siteId)
                      .map((item) => (
                        <SelectItem key={item.id} value={String(item.id)}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            {editing ? null : (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="user-active"
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(checked === true)}
                />
                <Label htmlFor="user-active" className="cursor-pointer font-normal">
                  Usuario activo
                </Label>
              </div>
            )}
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

      <Dialog
        open={passwordUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null)
            setNewPassword("")
            setPasswordError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              {passwordUser
                ? `Nueva contraseña para ${passwordUser.email}.`
                : "Elige una contraseña de al menos 8 caracteres."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void handleChangePassword()
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="user-new-password">Nueva contraseña</Label>
              <PasswordInput
                id="user-new-password"
                key={passwordUser?.id ?? "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
              {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordUser(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={savingPassword}>
                <Save className="h-4 w-4" />
                {savingPassword ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
