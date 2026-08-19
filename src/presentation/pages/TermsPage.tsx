import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { SiteFooter } from "@/presentation/components/SiteFooter"
import { ThemeToggle } from "@/presentation/components/ThemeToggle"
import { Button } from "@/shared/ui/button"

export function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundImage: "var(--page-gradient)" }}>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <Button asChild variant="ghost" className="-ml-3 h-8 px-3 text-muted-foreground">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
              Uso de la plataforma
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Términos y condiciones de uso
            </h1>
            <p className="text-sm text-muted-foreground">
              Última actualización: 18 de agosto de 2026. Al usar esta plataforma aceptas estos
              términos.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <article className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">1. Origen y propósito</h2>
            <p>
              Este software nace como una donación de <strong className="text-foreground">Ruyhub</strong>{" "}
              para ayudar a organizar medicamentos en el marco de la tragedia del terremoto ocurrido
              en Colombia el 10 de agosto de 2026. Su único fin es facilitar el inventario y la
              coordinación humanitaria de centros de acopio. No es un producto comercial.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">2. Alcance geográfico y sedes</h2>
            <p>
              Actualmente la plataforma opera principalmente para el municipio de{" "}
              <strong className="text-foreground">Sevilla, Valle del Cauca</strong>, aunque estamos
              evaluando expandir el servicio a más territorios según la evolución de la emergencia.
              La creación de sedes y centros de acopio está controlada: no cualquiera puede abrir una
              sede. Quienes administramos la plataforma nos reservamos el derecho de autorizar,
              rechazar o retirar sedes según la necesidad de la emergencia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">3. Acceso por centro de acopio</h2>
            <p>
              Cada centro de acopio debe contar con un acceso propio. Ese acceso es de uso exclusivo
              de la sede asignada: cada centro agrega y administra únicamente sus medicamentos. Está
              prohibido compartir credenciales, usar la cuenta de otro centro o registrar inventario
              que no corresponda a la sede autorizada.
            </p>
            <p>
              Cada centro tiene libertad de publicar su inventario en el catálogo público o de
              mantenerlo como uso interno. Un centro puede optar por no hacerlo público, por ejemplo
              cuando destina los medicamentos a lugares más vulnerables o de difícil acceso.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">4. Uso permitido y uso indebido</h2>
            <p>
              El uso autorizado se limita a la organización de medicamentos relacionada con esta
              emergencia. Queda prohibido destinar la plataforma a fines ajenos a la tragedia, a
              actividades no autorizadas, o a cualquier uso indebido de la información, las cuentas
              o el inventario.
            </p>
            <p>
              Por seguridad, nos reservamos el derecho de eliminar cualquier cuenta que incumpla
              estos términos y condiciones, o que destine esta plataforma a un uso indebido y/o no
              autorizado que no corresponda a la tragedia.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">5. Limitación de responsabilidad</h2>
            <p>
              Ruyhub creó el software, lo presta de forma gratuita y pone a disposición el servidor.
              Agradecemos esa ayuda. Ni Ruyhub ni quienes operamos esta instancia nos hacemos
              responsables de los daños que puedan causarse a través de este software, ni del mal uso
              que se haga de él, ni de decisiones clínicas, logísticas o de entrega tomadas con base
              en la información registrada.
            </p>
            <p>
              El inventario depende de lo que cada centro de acopio registre. La plataforma no
              garantiza exactitud, disponibilidad continua, ni idoneidad de los medicamentos
              publicados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">6. Propiedad intelectual</h2>
            <p>
              El software es de propiedad de <strong className="text-foreground">Ruyhub</strong>,
              quien ostenta los derechos de autor. Está prohibido venderlo, distribuirlo o
              comercializarlo bajo cualquier concepto, total o parcialmente, sin autorización
              expresa de Ruyhub.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">7. Aceptación</h2>
            <p>
              El ingreso a la plataforma, el registro de inventario o el uso del catálogo público
              implica la aceptación de estos términos. Si no estás de acuerdo, no debes utilizar el
              software.
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
