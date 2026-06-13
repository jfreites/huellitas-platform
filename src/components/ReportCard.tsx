import Link from 'next/link';
import { ArrowUpRight, Calendar, MapPin, ShieldCheck, Sparkles, Tag } from 'lucide-react';
import { CAT_BREEDS, DOG_BREEDS } from '@/data/breeds';
import { FUR_COLORS } from '@/data/fur-colors';
import { REPORT_STATUS_BADGE, REPORT_STATUS_LABEL } from '@/lib/supabase/types';
import type { Report } from '@/lib/supabase/types';

interface ReportCardProps {
  report: Report;
}

function getDisplayValue(
  value: string | null | undefined,
  dictionary: Array<{ slug: string; name: string }>
) {
  if (!value || value === 'No especificado') return null;
  return dictionary.find((item) => item.slug === value)?.name || value;
}

function getRelativeDate(date: string) {
  const timestamp = new Date(date).getTime();
  if (!Number.isFinite(timestamp)) return null;

  const diffMs = Date.now() - timestamp;
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 30) return `hace ${diffDays} días`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return 'hace 1 mes';
  return `hace ${diffMonths} meses`;
}

export default function ReportCard({ report }: ReportCardProps) {
  const isLost = report.type === 'LOST';
  const mainImage =
    report.images?.[0]?.publicUrl ||
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600&auto=format&fit=crop';
  const colorName = getDisplayValue(report.color, FUR_COLORS);
  const breedName = getDisplayValue(
    report.breed,
    report.species === 'DOG' ? DOG_BREEDS : CAT_BREEDS
  );
  const relativeDate = getRelativeDate(report.date);

  const formattedDate = new Date(report.date).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      href={`/reportes/${report.id}`}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl ${
        isLost ? 'border-rose-200' : 'border-emerald-200'
      }`}
    >
      <div className={`h-1.5 w-full ${isLost ? 'bg-lost' : 'bg-found'}`} />
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={report.name || 'Mascota'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex gap-1.5">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm border ${
              isLost ? 'bg-lost border-rose-400/30' : 'bg-found border-emerald-500/30'
            }`}
          >
            {isLost ? 'Perdido' : 'Encontrado'}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ${
              REPORT_STATUS_BADGE[report.status] ||
              'bg-stone-100 text-stone-700 dark:bg-stone-850 dark:text-stone-300 border-stone-200'
            }`}
          >
            {REPORT_STATUS_LABEL[report.status] || 'Reportado'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-background/90 backdrop-blur-md border border-border px-2.5 py-1.5 text-foreground/80 shadow-sm text-xs font-bold flex items-center gap-1">
          <span>{report.species === 'DOG' ? '🐕' : '🐈'}</span>
          <span>{report.species === 'DOG' ? 'Perro' : 'Gato'}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-black tracking-tight line-clamp-1 group-hover:text-lost transition-colors">
              {isLost
                ? report.name || 'Mascota sin nombre'
                : `Mascota encontrada (${report.species === 'DOG' ? 'perro' : 'gato'})`}
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-foreground/50">
              {relativeDate ? `${isLost ? 'Perdido' : 'Encontrado'} ${relativeDate}` : formattedDate}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              isLost ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {isLost ? 'Urgente' : 'Resguardo'}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {colorName && (
            <span className="inline-flex items-center gap-1 rounded bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-foreground/70">
              <Tag className="h-3 w-3" />
              {colorName}
            </span>
          )}
          {breedName && (
            <span className="inline-flex items-center gap-1 rounded bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-xs text-foreground/70">
              <Sparkles className="h-3 w-3" />
              {breedName}
            </span>
          )}
          {report.has_collar && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
              🎀 Collar
            </span>
          )}
          {report.has_chip && (
            <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
              <ShieldCheck className="h-3 w-3" />
              Microchip
            </span>
          )}
        </div>

        <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-foreground/60">
          <div className="flex items-center space-x-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-lost/70" />
            <span className="line-clamp-2 font-bold text-foreground/75">{report.location}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-foreground/45" />
            <span>
              {isLost ? 'Perdido el' : 'Encontrado el'} {formattedDate}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
          <span className="text-[11px] font-bold uppercase tracking-wide text-foreground/45">
            Reporte verificado
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-black text-lost">
            Ver reporte
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
