'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Check, Filter, RefreshCw, Search, X } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import { REPORT_STATUS_LABEL } from '@/lib/supabase/types';
import type { PetSpecies, PetStatus, ReportType } from '@/lib/supabase/types';

type FilterKey = 'type' | 'species' | 'status' | 'search' | 'location';

const TYPE_OPTIONS: Array<{ value: 'ALL' | ReportType; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'LOST', label: 'Perdidos' },
  { value: 'FOUND', label: 'Encontrados' },
];

const SPECIES_OPTIONS: Array<{ value: 'ALL' | PetSpecies; label: string }> = [
  { value: 'ALL', label: 'Perros y gatos' },
  { value: 'DOG', label: 'Perros' },
  { value: 'CAT', label: 'Gatos' },
];

const STATUS_OPTIONS: Array<{ value: 'ALL' | PetStatus; label: string }> = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'LOST_ACTIVE', label: REPORT_STATUS_LABEL.LOST_ACTIVE },
  { value: 'IN_SHELTER', label: REPORT_STATUS_LABEL.IN_SHELTER },
  { value: 'WANDERING', label: REPORT_STATUS_LABEL.WANDERING },
  { value: 'FOUND_DEAD', label: REPORT_STATUS_LABEL.FOUND_DEAD },
  { value: 'REUNITED', label: REPORT_STATUS_LABEL.REUNITED },
];

function getLabel(key: FilterKey, value: string) {
  if (key === 'type') return TYPE_OPTIONS.find((item) => item.value === value)?.label;
  if (key === 'species') return SPECIES_OPTIONS.find((item) => item.value === value)?.label;
  if (key === 'status') return STATUS_OPTIONS.find((item) => item.value === value)?.label;
  return value;
}

export default function ReportFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  useEffect(() => {
    let active = true;
    const nextSearch = searchParams.get('search') || '';
    const nextLocation = searchParams.get('location') || '';
    queueMicrotask(() => {
      if (!active) return;
      setSearch(nextSearch);
      setLocation(nextLocation);
    });
    return () => {
      active = false;
    };
  }, [searchParams]);

  const currentType = searchParams.get('type') || 'ALL';
  const currentSpecies = searchParams.get('species') || 'ALL';
  const currentStatus = searchParams.get('status') || 'ALL';

  const activeFilters = useMemo(() => {
    const entries: Array<{ key: FilterKey; value: string; label: string }> = [];
    (['type', 'species', 'status', 'search', 'location'] as FilterKey[]).forEach((key) => {
      const value = searchParams.get(key);
      if (!value || value === 'ALL') return;
      entries.push({
        key,
        value,
        label: `${key === 'search' ? 'Texto' : key === 'location' ? 'Zona' : 'Filtro'}: ${
          getLabel(key, value) || value
        }`,
      });
    });
    return entries;
  }, [searchParams]);

  const pushParams = (params: URLSearchParams) => {
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname);
    });
  };

  const updateFilter = (key: FilterKey, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'ALL') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    pushParams(params);
  };

  const removeFilter = (key: FilterKey) => {
    if (key === 'search') setSearch('');
    if (key === 'location') setLocation('');
    updateFilter(key, '');
  };

  const handleTextSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search.trim()) params.set('search', search.trim());
    else params.delete('search');
    if (location.trim()) params.set('location', location.trim());
    else params.delete('location');
    pushParams(params);
  };

  return (
    <section className="space-y-3">
      <form
        onSubmit={handleTextSubmit}
        className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/45" />
            <input
              type="text"
              placeholder="Nombre, color o rasgo distintivo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm font-medium focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15"
            />
          </div>

          <AddressAutocomplete
            id="filter-location"
            value={location}
            onChange={setLocation}
            onSelect={(selection) => setLocation(selection.address)}
            placeholder="Zona, colonia o punto de referencia"
            iconClassName="text-lost/70"
            inputClassName="h-10 w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm font-medium focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15"
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 text-sm font-black text-white transition-colors hover:bg-stone-800 lg:flex-none"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-black text-foreground transition-colors hover:border-lost/50 lg:hidden"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </div>
        </div>

        <div className="mt-4 hidden grid-cols-1 gap-3 border-t border-border/70 pt-4 lg:grid lg:grid-cols-[1fr_1fr_1.2fr]">
          <SegmentedControl
            label="Tipo"
            value={currentType}
            options={TYPE_OPTIONS}
            onChange={(value) => updateFilter('type', value)}
          />
          <SegmentedControl
            label="Especie"
            value={currentSpecies}
            options={SPECIES_OPTIONS}
            onChange={(value) => updateFilter('species', value)}
          />
          <SelectControl
            label="Estatus"
            value={currentStatus}
            options={STATUS_OPTIONS}
            onChange={(value) => updateFilter('status', value)}
          />
        </div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            key={`${filter.key}-${filter.value}`}
            type="button"
            onClick={() => removeFilter(filter.key)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground/75 shadow-xs transition-colors hover:border-lost/40 hover:text-lost"
          >
            {filter.label}
            <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {activeFilters.length > 0 && (
          <Link
            href="/reportes"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black text-lost transition-colors hover:bg-rose-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Limpiar filtros
          </Link>
        )}
        <span className="ml-auto hidden text-xs font-semibold text-foreground/45 sm:inline">
          {isPending ? 'Actualizando resultados...' : 'Filtros sincronizados'}
        </span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar filtros"
            className="absolute inset-0 bg-stone-950/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-lost">
                  Búsqueda rápida
                </p>
                <h2 className="text-xl font-black">Filtros</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-border p-2"
                aria-label="Cerrar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <SegmentedControl
                label="Tipo"
                value={currentType}
                options={TYPE_OPTIONS}
                onChange={(value) => updateFilter('type', value)}
              />
              <SegmentedControl
                label="Especie"
                value={currentSpecies}
                options={SPECIES_OPTIONS}
                onChange={(value) => updateFilter('species', value)}
              />
              <SelectControl
                label="Estatus"
                value={currentStatus}
                options={STATUS_OPTIONS}
                onChange={(value) => updateFilter('status', value)}
              />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-lost text-sm font-black text-white"
              >
                <Check className="h-4 w-4" />
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-black uppercase tracking-wider text-foreground/45">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-background p-1">
        {options.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-9 rounded-lg px-2 text-xs font-black transition-colors ${
                isActive
                  ? 'bg-stone-950 text-white shadow-sm'
                  : 'text-foreground/60 hover:bg-stone-100'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black uppercase tracking-wider text-foreground/45">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
