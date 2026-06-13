'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { APIProvider, InfoWindow, Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin, Navigation } from 'lucide-react';
import type { Report } from '@/lib/supabase/types';

interface ReportMapProps {
  reports: Report[];
  apiKey?: string;
}

type MapReport = Report & {
  latitude: number;
  longitude: number;
};

function getReportTitle(report: Report) {
  if (report.type === 'LOST') return report.name || 'Mascota perdida';
  return `Mascota encontrada (${report.species === 'DOG' ? 'perro' : 'gato'})`;
}

function getZoneStats(reports: Report[]) {
  const stats = new globalThis.Map<string, number>();
  reports.forEach((report) => {
    const zone = report.location.split(',')[0]?.trim() || report.location;
    if (!zone) return;
    stats.set(zone, (stats.get(zone) || 0) + 1);
  });
  return Array.from(stats.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
}

export default function ReportMap({ reports, apiKey }: ReportMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mappedReports = useMemo(
    () =>
      reports.filter(
        (report): report is MapReport =>
          typeof report.latitude === 'number' &&
          typeof report.longitude === 'number' &&
          Number.isFinite(report.latitude) &&
          Number.isFinite(report.longitude)
      ),
    [reports]
  );

  const selectedReport =
    mappedReports.find((report) => report.id === selectedId) || null;

  const center = mappedReports[0]
    ? { lat: mappedReports[0].latitude, lng: mappedReports[0].longitude }
    : { lat: 19.4326, lng: -99.1332 };
  const canUseGoogleSymbol = typeof google !== 'undefined';

  if (!apiKey || mappedReports.length === 0) {
    const zoneStats = getZoneStats(reports);
    return (
      <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-lost/10 p-3 text-lost">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black">Mapa no disponible</h2>
            <p className="mt-1 text-sm leading-relaxed text-foreground/60">
              {apiKey
                ? 'Estos reportes no tienen coordenadas guardadas. Puedes usar las zonas como referencia.'
                : 'Falta configurar Google Maps. La lista sigue funcionando con las zonas reportadas.'}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-foreground/45">
            Zonas con reportes
          </p>
          {zoneStats.length > 0 ? (
            zoneStats.map(([zone, count]) => (
              <div
                key={zone}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
              >
                <span className="line-clamp-1 text-sm font-bold">{zone}</span>
                <span className="rounded-full bg-stone-900 px-2 py-0.5 text-xs font-black text-white">
                  {count}
                </span>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground/55">
              No hay zonas para mostrar con los filtros actuales.
            </p>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-lost">
            Mapa de reportes
          </p>
          <h2 className="text-base font-black">{mappedReports.length} ubicaciones</h2>
        </div>
        <Navigation className="h-5 w-5 text-foreground/40" />
      </div>

      <div className="h-[440px] w-full lg:h-[560px]">
        <APIProvider apiKey={apiKey} libraries={['places']}>
          <GoogleMap
            defaultCenter={center}
            defaultZoom={12}
            gestureHandling="greedy"
            disableDefaultUI
            zoomControl
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            className="h-full w-full"
            mapId="PET_REPORTS"
          >
            {mappedReports.map((report) => (
              <AdvancedMarker
                key={report.id}
                position={{ lat: report.latitude, lng: report.longitude }}
                title={getReportTitle(report)}
                label={report.type === 'LOST' ? '!' : '✓'}
                icon={
                  canUseGoogleSymbol
                    ? {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: report.type === 'LOST' ? '#f43f5e' : '#059669',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                      }
                    : undefined
                }
                onClick={() => setSelectedId(report.id)}
              />
            ))}

            {selectedReport && (
              <InfoWindow
                position={{
                  lat: selectedReport.latitude,
                  lng: selectedReport.longitude,
                }}
                onCloseClick={() => setSelectedId(null)}
              >
                <div className="max-w-56 text-stone-950">
                  <p className="text-sm font-black">{getReportTitle(selectedReport)}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-stone-600">
                    {selectedReport.location}
                  </p>
                  <Link
                    href={`/reportes/${selectedReport.id}`}
                    className="mt-2 inline-flex text-xs font-black text-rose-600"
                  >
                    Abrir reporte
                  </Link>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>
      </div>
    </aside>
  );
}
