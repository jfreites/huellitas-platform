import Link from 'next/link';
import {
  Search,
  Megaphone,
  Heart,
  MapPin,
  PawPrint,
  Clock,
  FileText,
  Sparkles,
  Home,
  Share2,
  Quote,
  ShieldCheck,
} from 'lucide-react';

export const metadata = {
  title: 'Huellitas — Reuniéndolos con su familia, juntos',
  description:
    'Comunidad que ayuda a reunir mascotas perdidas con sus familias a través de alertas, reportes y pósters imprimibles.',
};

const recentReports = [
  {
    id: 1,
    badge: 'LOST',
    badgeClass: 'bg-lost/10 text-lost',
    name: 'Oliver',
    meta: 'Maltipoo · a 2 km',
    icon: Clock,
    detail: 'Visto por última vez hace 4 h',
  },
  {
    id: 2,
    badge: 'FOUND',
    badgeClass: 'bg-found/10 text-found',
    name: 'Desconocido',
    meta: 'Doméstico pelo corto · Centro',
    icon: MapPin,
    detail: 'Cerca del Parque Central',
  },
  {
    id: 3,
    badge: 'LOST',
    badgeClass: 'bg-lost/10 text-lost',
    name: 'Max',
    meta: 'Labrador · Zona oeste',
    icon: Clock,
    detail: 'Visto por última vez hace 12 h',
  },
  {
    id: 4,
    badge: 'FOUND',
    badgeClass: 'bg-found/10 text-found',
    name: 'Desconocido',
    meta: 'Maine Coon mestizo · East Village',
    icon: MapPin,
    detail: 'Encontrado en Café Nero',
  },
];

const steps = [
  {
    icon: FileText,
    title: 'Reporta',
    description:
      'Completa un formulario detallado con fotos, características y el último lugar donde se vio a la mascota.',
  },
  {
    icon: Megaphone,
    title: 'Difunde',
    description:
      'Nuestro sistema alerta automáticamente a vecinos y refugios cercanos al lugar del hecho.',
  },
  {
    icon: Heart,
    title: 'Reúne',
    description:
      'Recibe notificaciones instantáneas ante una posible coincidencia. Facilitamos el contacto seguro entre usuarios.',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* 1. Header inline */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
              <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <Link href="/" className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lost to-orange-500 text-white shadow-sm">
                  <PawPrint className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-extrabold tracking-tight">Huellitas</span>
              </Link>

              <nav className="hidden md:flex items-center gap-1">
                  {[
                  { label: 'Inicio', href: '/' },
                  { label: 'Reportar', href: '/reportes/nuevo?type=LOST' },
                  { label: 'Encontré', href: '/reportes/nuevo?type=FOUND' },
                  { label: 'Historias', href: '/reportes' },
                  ].map((item) => (
                  <Link
                      key={item.label}
                      href={item.href}
                      className="rounded-full px-4 py-2 text-sm font-semibold text-foreground/70 hover:bg-foreground/5 hover:text-foreground transition-colors"
                  >
                      {item.label}
                  </Link>
                  ))}
              </nav>

              <div className="flex items-center gap-2">
                  <Link
                  href="/login"
                  className="hidden sm:inline-flex h-10 items-center rounded-full px-4 text-sm font-bold text-foreground/80 hover:text-foreground transition-colors"
                  >
                  Iniciar sesión
                  </Link>
                  <Link
                  href="/login?mode=signup"
                  className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-bold text-background hover:opacity-90 transition-opacity"
                  >
                  Crear cuenta
                  </Link>
              </div>
              </div>
      </header>
      {/* 2. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-500/10 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lost/10 px-4 py-1.5 text-xs font-semibold text-lost mb-6 animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>Ayudando a reunir familias desde hoy</span>
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Reuniéndolos con su familia,
            <span className="block mt-2 bg-gradient-to-r from-lost to-orange-500 bg-clip-text text-transparent">
              juntos.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-foreground/75 font-normal leading-relaxed">
            Reunimos mascotas perdidas con sus familias mediante una red comunitaria. Cuando un
            ser querido desaparece, cada segundo cuenta.
          </p>

          <div className="mx-auto mt-10 max-w-md sm:max-w-xl flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reportes/nuevo?type=LOST"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-lost px-8 text-base font-bold text-white shadow-lg hover:bg-rose-600 transition-all"
            >
              <Search className="h-5 w-5" />
              <span>Reportar mascota perdida</span>
            </Link>
            <Link
              href="/reportes/nuevo?type=FOUND"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-found px-8 text-base font-bold text-white shadow-lg hover:bg-emerald-700 transition-all"
            >
              <PawPrint className="h-5 w-5" />
              <span>Encontré una mascota</span>
            </Link>
          </div>
        </div>

        <div className="absolute top-[-300px] left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-lost/5 blur-3xl -z-10" />
      </section>

      {/* 3. Banner "Bella fue encontrada" */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-3 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-found/15 text-found">
            <Heart className="h-4 w-4 fill-found" />
          </span>
          <p className="text-sm font-semibold text-foreground">
            <span className="text-found">¡Bella fue encontrada!</span>
            <span className="text-foreground/60 font-normal"> · hace 2 minutos en Austin, TX</span>
          </p>
        </div>
      </section>

      {/* 4. Stats */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Mascotas reunidas' },
            { value: '10k+', label: 'Miembros en la comunidad' },
            { value: '24/7', label: 'Soporte activo' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-6 text-center hover-lift"
            >
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-lost to-orange-500 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-foreground/60 uppercase tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Cómo funciona */}
      <section className="border-t border-border bg-stone-50/50 dark:bg-stone-950/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Reuniones en 3 simples pasos
            </h2>
            <p className="mt-3 text-sm sm:text-base text-foreground/60">
              Eliminamos barreras técnicas para que cualquier persona pueda ayudar o pedir auxilio
              rápidamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lost/10 text-lost mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/40">
                    Paso {idx + 1}
                  </span>
                  <h3 className="mt-1 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Reportes recientes */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Perdidos y encontrados
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-foreground/60">
              Revisa los reportes más recientes en tu comunidad.
            </p>
          </div>
          <Link
            href="/reportes"
            className="flex items-center gap-1 text-sm font-semibold text-lost hover:underline"
          >
            <span>Ver todos los reportes</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentReports.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.id}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 hover-lift"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest ${report.badgeClass}`}
                  >
                    {report.badge}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 group-hover:bg-lost/10 group-hover:text-lost transition-colors">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="aspect-square w-full rounded-xl bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 mb-4 flex items-center justify-center">
                  <PawPrint className="h-12 w-12 text-foreground/15" />
                </div>
                <h3 className="text-base font-bold text-foreground">{report.name}</h3>
                <p className="text-xs text-foreground/60 mt-0.5">{report.meta}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-foreground/50">
                  <Icon className="h-3 w-3" />
                  <span>{report.detail}</span>
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Historia de éxito */}
      <section className="bg-stone-900 text-stone-100 dark:bg-stone-950 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Historias de éxito
            </h2>
            <p className="mt-2 text-sm text-stone-400">
              Reencuentros reales, familias reales, alegría real.
            </p>
          </div>

          <div className="relative rounded-2xl border border-stone-800 bg-stone-900/50 p-8 sm:p-10">
            <Quote className="absolute -top-4 left-8 h-8 w-8 text-lost fill-lost/20" />
            <blockquote className="text-base sm:text-lg leading-relaxed text-stone-200">
              &ldquo;Cuando Toby se escapó durante los fuegos artificiales, fue devastador. Las
              alertas comunitarias de Huellitas llegaron a nuestros vecinos en minutos. A la
              mañana siguiente, alguien a tres calles lo reconoció por la notificación y nos
              llamó. ¡Estaremos eternamente agradecidos!&rdquo;
            </blockquote>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-lost to-orange-500 text-white text-base font-extrabold">
                MT
              </div>
              <div>
                <p className="text-sm font-bold text-stone-100">Mark & Toby</p>
                <p className="text-xs text-stone-400">Reunidos después de 18 horas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Join */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-stone-50 dark:to-stone-900/30 p-8 sm:p-14 text-center">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-lost/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-found/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-found/10 px-4 py-1.5 text-xs font-semibold text-found mb-5">
              <ShieldCheck className="h-3 w-3" />
              <span>Comunidad verificada</span>
            </div>

            <h2 className="mx-auto max-w-2xl text-2xl sm:text-4xl font-extrabold tracking-tight">
              Únete a nuestra comunidad de amantes de los animales.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-foreground/70">
              Crea una cuenta hoy para mantenerte alerta, publicar reportes y ayudar a reunir
              mascotas en tu vecindario.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login?mode=signup"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-foreground px-6 text-sm font-bold text-background hover:opacity-90 transition-opacity"
              >
                Comenzar ahora
              </Link>
              <Link
                href="#"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-bold text-foreground hover:bg-foreground/5 transition-colors"
              >
                Conoce más
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer inline */}
        <footer className="border-t border-border bg-stone-50/50 dark:bg-stone-950/20 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lost to-orange-500 text-white shadow-sm">
                    <PawPrint className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-extrabold tracking-tight">Huellitas</span>
                </Link>
                <p className="mt-3 max-w-sm text-sm text-foreground/60 leading-relaxed">
                    Haciendo el mundo más pequeño para las mascotas perdidas. Dedicados a un rescate
                    animal eficiente y compasivo.
                </p>
                </div>

                <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground/50 mb-3">
                    Explorar
                </h4>
                <ul className="space-y-2 text-sm">
                    <li>
                    <Link href="/reportes" className="text-foreground/70 hover:text-lost">
                        Comunidad
                    </Link>
                    </li>
                    <li>
                    <Link href="#" className="text-foreground/70 hover:text-lost">
                        Soporte
                    </Link>
                    </li>
                </ul>
                </div>

                <div>
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-foreground/50 mb-3">
                    Legal
                </h4>
                <ul className="space-y-2 text-sm">
                    <li>
                    <Link href="#" className="text-foreground/70 hover:text-lost">
                        Política de privacidad
                    </Link>
                    </li>
                    <li>
                    <Link href="#" className="text-foreground/70 hover:text-lost">
                        Términos de servicio
                    </Link>
                    </li>
                </ul>
                </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
                <p className="text-xs text-foreground/50">
                © {new Date().getFullYear()} Huellitas Rescue. Todos los derechos reservados.
                </p>
                <div className="flex items-center gap-3">
                <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-lost/10 hover:text-lost transition-colors"
                    aria-label="Compartir"
                >
                    <Share2 className="h-4 w-4" />
                </Link>
                <Link
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground/5 text-foreground/60 hover:bg-lost/10 hover:text-lost transition-colors"
                    aria-label="Comunidad"
                >
                    <Home className="h-4 w-4" />
                </Link>
                </div>
            </div>
            </div>
        </footer>
    </>
  );
}
