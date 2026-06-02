import Link from 'next/link';
import { getReports } from '@/actions/reports';
import ReportCard from '@/components/ReportCard';
import ReportFilters from '@/components/ReportFilters';
import { PlusCircle, Info, RefreshCw } from 'lucide-react';

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

  const reports = result.success ? result.reports || [] : [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Buscador de Mascotas Perdidas y Encontradas
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-foreground/60 max-w-2xl">
            Filtra y busca entre reportes activos. Si viste a una mascota que coincide, utiliza el botón de contacto en su póster.
          </p>
        </div>
        
        <Link
          href="/reportes/nuevo"
          className="inline-flex items-center gap-1.5 rounded-full bg-lost px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg hover:bg-rose-600 transition-all active:scale-95"
        >
          <PlusCircle className="h-4.5 w-4.5" />
          <span>Reportar Mascota</span>
        </Link>
      </div>

      {/* Panel de Filtros Reactivos */}
      <div className="mb-8">
        <ReportFilters />
      </div>

      {/* Resultados Grid */}
      {reports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report: any) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center max-w-xl mx-auto shadow-xs">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-lg font-bold">No se encontraron mascotas con estos filtros</h3>
          <p className="mt-2 text-xs sm:text-sm text-foreground/60 leading-relaxed">
            Intenta limpiando la barra de búsqueda o ampliando la especie/ubicación seleccionada. Si acabas de ver a un perro o gato extraviado, puedes reportarlo tú mismo.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/reportes"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Limpiar Todos los Filtros</span>
            </Link>
            <Link
              href="/reportes/nuevo"
              className="rounded-full bg-lost text-white px-5 py-2 text-xs font-bold hover:bg-rose-600 transition-colors"
            >
              Crear Nuevo Reporte
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
