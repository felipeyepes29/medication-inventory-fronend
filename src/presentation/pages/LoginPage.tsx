import { useState, type FormEvent } from "react"
import { ArrowLeft, LogIn, User } from "lucide-react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { SiteFooter } from "@/presentation/components/SiteFooter"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { useAuth } from "@/presentation/hooks/useAuth"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { PasswordInput } from "@/shared/ui/password-input"

export function LoginPage() {
  const { user, login } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/app"
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await login(identifier, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "var(--page-gradient)" }}>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Ingreso al inventario</h1>
              <p className="text-sm text-muted-foreground">
                Puedes entrar con tu nombre de usuario o con tu correo electrónico.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-identifier">Usuario o correo electrónico</Label>
            <Input
              id="login-identifier"
              name="username"
              icon={User}
              type="text"
              inputMode="text"
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="admin o correo@ejemplo.com"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Admite ambos: nombre de usuario o correo.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Contraseña</Label>
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            <LogIn className="h-4 w-4" />
            {submitting ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al catálogo público
            </Link>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/terminos" className="underline-offset-4 hover:underline">
              Términos y condiciones
            </Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </div>
  )
}
