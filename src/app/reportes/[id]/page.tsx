import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getReportById } from '@/actions/reports';
import { getSession } from '@/lib/supabase/session';
import { maskContactPhone } from '@/lib/phone';
import { Calendar, MapPin, Phone, ArrowLeft, QrCode, MessageCircle } from 'lucide-react';
import OwnerControls from '@/components/OwnerControls';
import ReportActions from '@/components/ReportActions';
import ContactPhoneCta from '@/components/ContactPhoneCta';
import { CAT_BREEDS } from '@/data/breeds';
import { FUR_COLORS } from '@/data/fur-colors';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const result = await getReportById(resolvedParams.id);
  if (!result.success || !result.report) {
    return { title: 'Mascota no encontrada - Huellitas' };
  }
  const report = result.report;
  const title = `🐾 ${report.type === 'LOST' ? '¡SE BUSCA!' : 'MASCOTA ENCONTRADA'}: ${report.name || (report.species === 'DOG' ? 'Perro' : 'Gato')}`;
  const description = `${report.species === 'DOG' ? '🐕 Perro' : '🐈 Gato'} de color ${report.color || 'no especificado'}, visto en ${report.location}. ¡Ayúdanos a compartir y lograr un reencuentro feliz!`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: report.images?.[0]?.publicUrl || '',
        }
      ],
    }
  };
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReportDetail({ params }: PageProps) {
  const resolvedParams = await params;
  const result = await getReportById(resolvedParams.id);
  const session = await getSession();

  if (!result.success || !result.report) {
    notFound();
  }

  const report = result.report;
  const isOwner = session?.user.id === report.user_id;
  const isLost = report.type === 'LOST';
  const mainImage =
    report.images?.[0]?.publicUrl ||
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop';

  const formattedDate = new Date(report.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Traducir Estatus para la UI
  const getStatusDisplay = () => {
    switch (report.status) {
      case 'LOST_ACTIVE':
        return { text: '¡SE BUSCA!', color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border-rose-200' };
      case 'IN_SHELTER':
        return { text: 'Mascota Resguardada', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200' };
      case 'WANDERING':
        return { text: 'Mascota Vista Libre', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200' };
      case 'FOUND_DEAD':
        return { text: 'Mascota sin Vida', color: 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border-stone-300' };
      case 'REUNITED':
        return { text: '¡REUNIDO CON SU FAMILIA!', color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-200' };
      default:
        return { text: 'Reporte de Mascota', color: 'text-foreground/75 bg-stone-50 border-border' };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Texto para compartir en WhatsApp (mascamos el teléfono para no exponerlo)
  const shareText = encodeURIComponent(
    `🐾 ¡POR FAVOR COMPARTE! Mascota ${isLost ? 'PERDIDA' : 'ENCONTRADA'}: ${isLost ? report.name : report.species === 'DOG' ? 'Perro' : 'Gato'
    } en ${report.location}. Ver detalles y联系方式 en: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }/reportes/${report.id}`
  );

  const petColor = FUR_COLORS.find(b => b.slug === report.color)
  const petBreed = CAT_BREEDS.find(b => b.slug === report.breed)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
      {/* Botón de regreso */}
      <div className="mb-6 no-print">
        <Link
          href="/reportes"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-foreground/60 hover:text-lost transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al catálogo de reportes</span>
        </Link>
      </div>

      {/* 1. Panel de Control del Propietario (Acciones Administrativas) */}
      {isOwner && (
        <OwnerControls reportId={report.id} isReunited={report.status === 'REUNITED'} />
      )}

      {/* 2. PÓSTER DE BÚSQUEDA (Diseño Enmarcado de Alto Impacto para Impresión/Pantalla) */}
      <div className="print-poster rounded-3xl border-3 border-foreground bg-card text-card-foreground p-5 sm:p-8 shadow-lg overflow-hidden relative">
        {/* Banner de estatus gigante */}
        <div className={`text-center border-b-2 border-foreground pb-4 mb-6`}>
          <h1 className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-foreground leading-tight">
            {statusDisplay.text}
          </h1>
          <p className="text-xs uppercase tracking-widest text-foreground/50 mt-1 font-bold">
            Red de Búsqueda Familiar Huellitas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Imagen de Mascota enmarcada */}
          <div className="relative aspect-4/3 md:aspect-square w-full rounded-2xl border-2 border-foreground overflow-hidden bg-stone-100 dark:bg-stone-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={report.name || 'Mascota'} className="h-full w-full object-cover" />

            {/* Especie Badge */}
            <div className="absolute bottom-4 right-4 rounded-full border-2 border-foreground bg-background px-3 py-1.5 text-xs font-black shadow-md">
              {report.species === 'DOG' ? '🐕 PERRO' : '🐈 GATO'}
            </div>
          </div>

          {/* Información Detallada del Póster */}
          <div className="space-y-5">
            {isLost && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/45">Nombre de la Mascota</label>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-0.5">{report.name}</h2>
              </div>
            )}

            {/* Datos Clave */}
            <div className="grid grid-cols-2 gap-4 border-y-2 border-foreground/10 py-4">
              <div>
                <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-bold uppercase tracking-wider">
                  <MapPin className="h-4 w-4 shrink-0 text-lost" />
                  <span>Zona</span>
                </div>
                <p className="text-sm font-extrabold mt-1 text-foreground">{report.location}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-foreground/60 text-xs font-bold uppercase tracking-wider">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Fecha</span>
                </div>
                <p className="text-sm font-extrabold mt-1 text-foreground">{formattedDate}</p>
              </div>
            </div>

            {/* Características Físicas */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground/45">Rasgos Físicos</h3>
              <div className="flex flex-wrap gap-1.5">
                {report.color && (
                  <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs font-extrabold bg-stone-50 dark:bg-stone-900/50">
                    🎨 Color: {petColor ? petColor.name : 'Sin información'}
                  </span>
                )}
                {report.breed && (
                  <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs font-extrabold bg-stone-50 dark:bg-stone-900/50">
                    🐾 Raza: {petBreed ? petBreed.name : 'Sin información'}
                  </span>
                )}
                <span className={`rounded-full border border-foreground/20 px-3 py-1 text-xs font-extrabold ${report.has_collar ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'opacity-40 line-through text-xs font-normal'}`}>
                  🎀 Collar: {report.has_collar ? 'Sí' : 'No'}
                </span>
                <span className={`rounded-full border border-foreground/20 px-3 py-1 text-xs font-extrabold ${report.has_chip ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'opacity-40 line-through text-xs font-normal'}`}>
                  💾 Chip: {report.has_chip ? 'Sí' : 'No'}
                </span>
                <span className={`rounded-full border border-foreground/20 px-3 py-1 text-xs font-extrabold ${report.has_spots ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'opacity-40 line-through text-xs font-normal'}`}>
                  manchas: {report.has_spots ? 'Sí' : 'No'}
                </span>
              </div>

              {report.distinctive_text && (
                <div className="rounded-xl border border-foreground/15 bg-stone-50/50 dark:bg-stone-900/10 p-3 mt-2">
                  <p className="text-xs font-bold leading-normal text-foreground/80">
                    <span className="text-lost mr-1 font-black">Detalle de Rasgo:</span>
                    {report.distinctive_text}
                  </p>
                </div>
              )}
            </div>

            {/* Teléfono de Contacto Gigante
            <ContactPhoneCta phone={report.contact_phone} />
            */}
          </div>
        </div>

        {/* Descripción e Historia del caso */}
        {report.description && (
          <div className="border-t-2 border-foreground/10 pt-5 mt-6 space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/45">Descripción del caso</h3>
            <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{report.description}</p>
          </div>
        )}

        {/* Firma / QR Mock para impresión */}
        <div className="hidden print:flex items-center justify-between border-t-2 border-foreground pt-5 mt-8 text-xs">
          <div className="max-w-xs">
            <p className="font-bold">Escanea para ver actualizaciones o enviar ubicación:</p>
            <p className="text-foreground/60 mt-0.5">huellitas.org/reportes/{report.id}</p>
          </div>
          <div className="border-2 border-foreground p-1 text-[8px] font-bold tracking-widest">
            QR CODE MOCK
          </div>
        </div>
      </div>

      {report.type === 'FOUND' ? (
        <div className="print:hidden flex flex-col bg-[#EAF3DE] border-2 border-solid border-[#C0DD97] p-6 rounded-3xl mt-4">
          <h3 className='text-[#3B6D11] text-xl'>🐾 ¿Es tu mascota o la reconoces?</h3>
          <p>Si este {report.species === 'CAT' ? 'gato' : 'perro'} es tuyo o sabes de quién es, comunícate con quien lo resguarda. Tu información no será pública.</p>
          <div className="py-2 flex">
            <button
              type="button"
              className="flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5 text-found" />
              <span>Contactar a quien lo resguarda</span>
            </button>
          </div>
          <div className="qr-hint flex items-center gap-2.5 bg-gray-100 mt-3 text-sm p-4">
            <div className="qr-box">
              <QrCode width={32} aria-hidden="true" />
            </div>
            <span>En el <strong>póster impreso</strong> aparece un QR que abre directamente esta pantalla — sin necesidad de buscar en la app.</span>
          </div>
        </div>
      ) : (
        <div className="print:hidden flex flex-col bg-[#FCEBEB] border-2 border-solid border-[#F7C1C1] p-6 rounded-3xl mt-4">
          <h3 className='text-[#A32D2D] text-xl'>🐾 ¿Viste o tienes a esta mascota?</h3>
          <p>Si encontraste a este {report.species === 'CAT' ? 'gato' : 'perro'} o lo viste recientemente, avísale a su dueño. Tu información no será pública.</p>
          <div className="py-2 flex">
            <button
              type="button"
              className="flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              <MessageCircle className="h-4.5 w-4.5 text-lost" />
              <span>Avisar al dueño</span>
            </button>
          </div>
          <div className="qr-hint flex items-center gap-2.5 bg-gray-100 mt-3 text-sm p-4">
            <div className="qr-box">
              <QrCode width={32} aria-hidden="true" />
            </div>
            <span>En el <strong>póster impreso</strong> aparece un QR que abre directamente esta pantalla — sin necesidad de buscar en la app.</span>
          </div>
        </div>
      )}

      <ReportActions shareText={shareText} />

    </div>
  );
}
