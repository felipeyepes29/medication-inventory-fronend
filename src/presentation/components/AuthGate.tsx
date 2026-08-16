import { useEffect, useState, type FormEvent, type ReactNode } from "react"
import { fetchAuthStatus, loginWithPassword } from "@/infrastructure/auth/auth-api"
import { getAccessToken } from "@/infrastructure/auth/token-storage"
import { setUnauthorizedHandler } from "@/infrastructure/http/api-client"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"

interface AuthGateProps {
  children: ReactNode
}

export function AuthGate({ children }: AuthGateProps) {
  const [checking, setChecking] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthenticated(false)
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const required = await fetchAuthStatus()
        if (cancelled) return
        setAuthRequired(required)
        if (!required) {
          setAuthenticated(true)
          return
        }
        setAuthenticated(Boolean(getAccessToken()))
      } catch {
        if (!cancelled) {
          setAuthRequired(true)
          setAuthenticated(Boolean(getAccessToken()))
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await loginWithPassword(password)
      setAuthenticated(true)
      setPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión")
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Verificando acceso...
      </div>
    )
  }

  if (authRequired && !authenticated) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        style={{ backgroundImage: "var(--page-gradient)" }}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm"
        >
          <div className="space-y-1">
            <h1 className="text-xl font-semibold">Acceso al inventario</h1>
            <p className="text-sm text-muted-foreground">
              Ingresa la contraseña compartida para continuar.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access-password">Contraseña</Label>
            <Input
              id="access-password"
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </main>
    )
  }

  return <>{children}</>
}
