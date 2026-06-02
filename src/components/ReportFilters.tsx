'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { Search, MapPin, Grid, Layers, Filter } from 'lucide-react';

export default function ReportFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados locales para evitar retrasos en el tipeo
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  // Sincronizar estados si cambian los parámetros de la URL externamente
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
  }, [searchParams]);

  // Aplicar filtros a la URL
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Resetear búsqueda si está vacío
    if (key === 'search' && !value) params.delete('search');
    if (key === 'location' && !value) params.delete('location');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Manejar debounced / submit para inputs de texto
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }

    if (location.trim()) {
      params.set('location', location.trim());
    } else {
      params.delete('location');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const currentType = searchParams.get('type') || 'ALL';
  const currentSpecies = searchParams.get('species') || 'ALL';
  const currentStatus = searchParams.get('status') || 'ALL';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <form onSubmit={handleTextSubmit} className="space-y-4">
        {/* Fila 1: Buscador y Ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="relative">
            <Search className="absolute top-3 left-3 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Buscar por nombre, color, rasgos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9.5 pr-4 text-sm focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute top-3 left-3 h-4 w-4 text-lost/70" />
            <input
              type="text"
              placeholder="Última ubicación vista..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-9.5 pr-4 text-sm focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all"
            />
          </div>
        </div>

        {/* Fila 2: Selectores de Especie, Tipo y Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tipo de Reporte */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">Tipo de Reporte</label>
            <select
              value={currentType}
              onChange={(e) => updateFilters('type', e.target.value)}
              className="rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-lost focus:outline-none transition-all"
            >
              <option value="ALL">🔍 Todos los Reportes</option>
              <option value="LOST">🔴 Perdidos (Urgente)</option>
              <option value="FOUND">🟢 Encontrados (Resguardos)</option>
            </select>
          </div>

          {/* Especie */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">Especie</label>
            <select
              value={currentSpecies}
              onChange={(e) => updateFilters('species', e.target.value)}
              className="rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-lost focus:outline-none transition-all"
            >
              <option value="ALL">🐾 Perros y Gatos</option>
              <option value="DOG">🐕 Perros</option>
              <option value="CAT">🐈 Gatos</option>
            </select>
          </div>

          {/* Estado de Búsqueda */}
          <div className="flex flex-col space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">Estatus de Mascota</label>
            <select
              value={currentStatus}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="rounded-xl border border-border bg-background py-2 px-3 text-sm focus:border-lost focus:outline-none transition-all"
            >
              <option value="ALL">📋 Todos los Estados</option>
              <option value="LOST_ACTIVE">Búsqueda Activa</option>
              <option value="IN_SHELTER">En Resguardo</option>
              <option value="WANDERING">Deambulando</option>
              <option value="FOUND_DEAD">Fallecido</option>
              <option value="REUNITED">Reunido con Familia</option>
            </select>
          </div>
        </div>

        {/* Botón de envío e indicador de carga */}
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <span className="text-xs text-foreground/45">
            {isPending ? 'Filtrando mascotas...' : 'Parámetros sincronizados'}
          </span>
          <button
            type="submit"
            className="rounded-full bg-stone-900 dark:bg-stone-100 hover:bg-stone-850 dark:hover:bg-stone-200 text-white dark:text-stone-900 px-5 py-2 text-xs font-bold transition-colors active:scale-95 shadow-sm"
          >
            Aplicar Filtros
          </button>
        </div>
      </form>
    </div>
  );
}
