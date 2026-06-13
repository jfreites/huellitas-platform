'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { List, MapPinned } from 'lucide-react';

interface ReportResultsShellProps {
  list: ReactNode;
  map: ReactNode;
}

export default function ReportResultsShell({ list, map }: ReportResultsShellProps) {
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-card p-1 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setActiveView('list')}
          className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors ${
            activeView === 'list'
              ? 'bg-stone-950 text-white'
              : 'text-foreground/60 hover:bg-stone-100'
          }`}
        >
          <List className="h-4 w-4" />
          Lista
        </button>
        <button
          type="button"
          onClick={() => setActiveView('map')}
          className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors ${
            activeView === 'map'
              ? 'bg-stone-950 text-white'
              : 'text-foreground/60 hover:bg-stone-100'
          }`}
        >
          <MapPinned className="h-4 w-4" />
          Mapa
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className={activeView === 'list' ? 'block' : 'hidden lg:block'}>
          {list}
        </div>
        <div className={activeView === 'map' ? 'block' : 'hidden lg:block'}>
          <div className="lg:sticky lg:top-24">{map}</div>
        </div>
      </div>
    </section>
  );
}
