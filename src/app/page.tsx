import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getPublicUrl } from '@/lib/supabase/storage';
import ReportCard from '@/components/ReportCard';
import { AlertCircle, CheckCircle, Search, ArrowRight, Shield, Heart } from 'lucide-react';

export const revalidate = 60; // Revalidar la landing cada minuto para mostrar casos frescos
export const dynamic = 'force-dynamic'; // El cliente de Supabase usa cookies; render dinámico obligatorio

export default async function Home() {
  let recentReports: any[] = [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select('*, images:report_images(*), user:profiles(id, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) throw error;

    recentReports = (data ?? []).map((row: any) => ({
      ...row,
      images: (row.images ?? []).map((img: any) => ({
        ...img,
        publicUrl: getPublicUrl(img.storage_path),
      })),
    }));
  } catch (error) {
    console.error('Fallo al obtener reportes en la landing:', error);
  }

  return (
    <div className="flex flex-col flex-grow">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-500/10 via-background to-background py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-lost/10 px-4 py-1.5 text-xs font-semibold text-lost mb-6 animate-pulse">
            <Heart className="h-3 w-3 fill-lost" />
            <span>Ayudando a reunir familias desde hoy</span>
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            ¿Se perdió tu compañero?
            <span className="block mt-2 bg-gradient-to-r from-lost to-orange-500 bg-clip-text text-transparent">
              Ayúdalo a volver a casa.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base sm:text-lg text-foreground/75 font-normal leading-relaxed">
            Publica reportes al instante, crea pósters imprimibles en segundos y comparte alertas geolocalizadas con protectores en tu zona. Es gratis y sin fricciones.
          </p>

          {/* CTAs Gigantes */}
          <div className="mx-auto mt-10 max-w-md sm:max-w-xl flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/reportes/nuevo?type=LOST"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-lost px-8 text-base font-bold text-white shadow-lg hover:shadow-xl hover:bg-rose-600 transition-all active:scale-98"
            >
              <AlertCircle className="h-5 w-5" />
              <span>Reportar Mascota Perdida</span>
            </Link>

            <Link
              href="/reportes/nuevo?type=FOUND"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-found px-8 text-base font-bold text-white shadow-lg hover:shadow-xl hover:bg-emerald-700 transition-all active:scale-98"
            >
              <CheckCircle className="h-5 w-5" />
              <span>Reportar Mascota Encontrada</span>
            </Link>
          </div>

          {/* Sub-enlace al catálogo */}
          <div className="mt-6 flex justify-center">
            <Link
              href="/reportes"
              className="group inline-flex items-center gap-1 text-sm font-semibold text-foreground/60 hover:text-lost transition-colors"
            >
              <span>Ver todas las mascotas reportadas</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Círculos decorativos en el fondo */}
        <div className="absolute top-[-300px] left-1/2 transform -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-lost/5 blur-3xl -z-10" />
      </section>

      {/* 2. ¿Cómo funciona? */}
      <section className="border-t border-border bg-stone-50/50 dark:bg-stone-950/20 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reencuentros en 3 Simples Pasos</h2>
            <p className="mt-3 text-sm sm:text-base text-foreground/60">
              Nuestra plataforma elimina barreras técnicas para que cualquier persona pueda ayudar o pedir auxilio rápidamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Paso 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lost/10 text-lost font-bold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold">Publica al Instante</h3>
              <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                Sube una foto clara, define rasgos (color, collar, chip) y marca el lugar y fecha donde ocurrió el hecho.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lost/10 text-lost font-bold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold">Genera y Comparte</h3>
              <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                Descarga un póster de búsqueda optimizado para imprimir, o compártelo directo en WhatsApp y redes sociales con metadatos vistosos.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-card border border-border rounded-2xl shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lost/10 text-lost font-bold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold">Reúne a la Familia</h3>
              <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
                Intercambia mensajes seguros usando el contacto telefónico directo de personas interesadas. ¡Fin del misterio!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Reportes Recientes */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Reportes Recientes</h2>
            <p className="mt-2 text-xs sm:text-sm text-foreground/60">Mascotas perdidas o en resguardo vistas recientemente en tu zona.</p>
          </div>
          <Link
            href="/reportes"
            className="flex items-center gap-1 text-sm font-semibold text-lost hover:underline"
          >
            <span>Ver todo el catálogo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentReports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentReports.map((report: any) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          /* Empty State con placeholders estéticos */
          <div className="rounded-2xl border border-dashed border-border bg-stone-50/50 dark:bg-stone-900/10 p-12 text-center">
            <span className="text-4xl mb-4 block">🏡</span>
            <h3 className="text-lg font-bold">No hay reportes activos en este momento</h3>
            <p className="mt-2 text-sm text-foreground/60 max-w-md mx-auto">
              Todo está tranquilo por ahora. Si conoces a alguien que haya perdido su mascota o resguardado un animalito, pídele que publique un reporte.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/reportes/nuevo?type=LOST"
                className="rounded-full bg-lost text-white px-5 py-2 text-xs font-bold shadow-xs hover:bg-rose-600 transition-colors"
              >
                Crear Reporte
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Seguridad de datos e identidad */}
      <section className="bg-stone-900 text-stone-100 dark:bg-stone-950 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-stone-850 border border-stone-800 p-3 text-lost shrink-0">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Validación de Identidad y Cero Spam</h3>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-400 max-w-xl leading-relaxed">
                Validamos a cada usuario mediante código OTP (correo y teléfono) antes de permitir publicaciones. Esto reduce estafas, datos erróneos y llamadas falsas, protegiendo a los dueños vulnerables.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex gap-4 w-full md:w-auto">
            <Link
              href="/login"
              className="w-full md:w-auto rounded-full bg-stone-100 hover:bg-stone-200 text-stone-900 px-6 py-3 text-xs font-bold transition-all text-center"
            >
              Probar Validación OTP
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
