import Link from 'next/link';
import { Calendar, MapPin, Tag, ShieldCheck } from 'lucide-react';
import { PetSpecies, PetStatus, ReportType } from '@prisma/client';

interface ReportCardProps {
  report: {
    id: string;
    type: ReportType;
    species: PetSpecies;
    name: string | null;
    status: PetStatus;
    location: string;
    date: Date;
    color: string | null;
    hasCollar: boolean;
    hasChip: boolean;
    images: Array<{ url: string }>;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  const isLost = report.type === 'LOST';
  const mainImage = report.images?.[0]?.url || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop';
  
  // Formatear Fecha
  const formattedDate = new Date(report.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Traducir Estatus para la UI
  const getStatusBadge = () => {
    switch (report.status) {
      case 'LOST_ACTIVE':
        return { text: 'Búsqueda Activa', class: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' };
      case 'IN_SHELTER':
        return { text: 'En Resguardo', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' };
      case 'WANDERING':
        return { text: 'Visto Deambulando', class: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' };
      case 'FOUND_DEAD':
        return { text: 'Encontrado sin Vida', class: 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-300 dark:border-stone-700' };
      case 'REUNITED':
        return { text: '¡Reunido!', class: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-900/50' };
      default:
        return { text: 'Reportado', class: 'bg-stone-100 text-stone-700 dark:bg-stone-850 dark:text-stone-300 border-stone-200' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <Link
      href={`/reportes/${report.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover-lift"
    >
      {/* Imagen */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={report.name || 'Mascota'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badge Principal: LOST o FOUND */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm border ${
              isLost
                ? 'bg-lost border-rose-400/30'
                : 'bg-found border-emerald-500/30'
            }`}
          >
            {isLost ? 'Perdido' : 'Encontrado'}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ${statusBadge.class}`}>
            {statusBadge.text}
          </span>
        </div>

        {/* Especie Icon Badge */}
        <div className="absolute bottom-3 right-3 rounded-full bg-background/80 backdrop-blur-md border border-border p-1.5 text-foreground/80 shadow-sm text-xs font-bold flex items-center gap-1">
          <span>{report.species === 'DOG' ? '🐕' : '🐈'}</span>
          <span>{report.species === 'DOG' ? 'Perro' : 'Gato'}</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-bold tracking-tight line-clamp-1 group-hover:text-lost transition-colors">
          {isLost ? report.name : `Mascota Encontrada (${report.species === 'DOG' ? 'Perro' : 'Gato'})`}
        </h3>

        {/* Tags de características */}
        <div className="mt-2 flex flex-wrap gap-1">
          {report.color && (
            <span className="inline-flex items-center gap-1 rounded bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-foreground/70">
              <Tag className="h-3 w-3" />
              {report.color}
            </span>
          )}
          {report.hasCollar && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
              🎀 Collar
            </span>
          )}
          {report.hasChip && (
            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" />
              Microchip
            </span>
          )}
        </div>

        {/* Ubicación y Fecha */}
        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-foreground/60">
          <div className="flex items-center space-x-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-lost/70" />
            <span className="line-clamp-1 font-medium">{report.location}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
            <span>
              {isLost ? 'Perdido el' : 'Encontrado el'} {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
