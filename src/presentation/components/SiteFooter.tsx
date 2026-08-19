import { Link } from "react-router-dom"

export function SiteFooter() {
  return (
    <footer className="border-t bg-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Gracias a <span className="font-medium text-foreground">Ruyhub</span> por donar este
          software gratuito, que nos ha ayudado a organizar el inventario de medicamentos.
        </p>
        <Link
          to="/terminos"
          className="shrink-0 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Términos y condiciones
        </Link>
      </div>
    </footer>
  )
}
