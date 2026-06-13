import Link from 'next/link';
import { getReports } from '@/actions/reports';
import ReportCard from '@/components/ReportCard';
import ReportFilters from '@/components/ReportFilters';
import ReportMap from '@/components/ReportMap';
import ReportResultsShell from '@/components/ReportResultsShell';
import { CheckCircle2, PlusCircle, RefreshCw, Siren } from 'lucide-react';
import type { Report } from '@/lib/supabase/types';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    species?: string;
    type?: string;
    status?: string;
    location?: string;
    search?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  // Realizar la consulta a la base de datos de manera síncrona/servidor con filtros
  const result = await getReports({
    species: params.species,
    type: params.type,
    status: params.status,
    location: params.location,
    search: params.search,
  });

  const reports = (result.success ? result.reports || [] : []) as Report[];
  const summary = {
    total: reports.length,
    lost: reports.filter((report) => report.type === 'LOST' && report.status !== 'REUNITED').length,
    found: reports.filter((report) => report.type === 'FOUND' && report.status !== 'REUNITED').length,
    reunited: reports.filter((report) => report.status === 'REUNITED').length,
  };
  const map = (
    <ReportMap
      reports={reports}
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
    />
  );
  const list = reports.length > 0 ? (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-xs sm:p-12">
      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-3xl">
        🔍
      </span>
      <h3 className="text-lg font-black">No encontramos coincidencias</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-foreground/60">
        Amplía la zona, elimina algún filtro o publica un reporte si acabas de ver una mascota extraviada.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/reportes"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-black transition-colors hover:bg-stone-50"
        >
          <RefreshCw className="h-4 w-4" />
          Limpiar filtros
        </Link>
        <Link
          href="/reportes/nuevo"
          className="inline-flex items-center justify-center rounded-xl bg-lost px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-rose-600"
        >
          Crear reporte
        </Link>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lost">
            Centro de búsqueda
          </p>
          <h1 className="mt-1 max-w-3xl text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Mascotas perdidas y encontradas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
            Busca por zona, rasgos y estado. Si reconoces una coincidencia, abre el reporte y envía información segura al responsable.
          </p>
        </div>
        
        <Link
          href="/reportes/nuevo"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-lost px-5 py-3 text-sm font-black text-white shadow-md transition-all hover:bg-rose-600 hover:shadow-lg active:scale-95 sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Reportar Mascota</span>
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Reportes" value={summary.total} icon={<Siren className="h-4 w-4" />} />
        <SummaryTile label="Perdidos activos" value={summary.lost} tone="lost" />
        <SummaryTile label="En resguardo" value={summary.found} tone="found" />
        <SummaryTile label="Reunidos" value={summary.reunited} icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* Panel de Filtros Reactivos */}
      <div className="mb-6">
        <ReportFilters />
      </div>

      {/* Resultados Grid */}
      <ReportResultsShell list={list} map={map} />
    </div>
  );
}

function SummaryTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon?: ReactNode;
  tone?: 'lost' | 'found';
}) {
  const toneClass =
    tone === 'lost'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : tone === 'found'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-border bg-card text-foreground';

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-black uppercase tracking-wider opacity-70">
          {label}
        </p>
        {icon || <CheckCircle2 className="h-4 w-4 opacity-70" />}
      </div>
      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}
