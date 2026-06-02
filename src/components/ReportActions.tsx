'use client';

import { Printer, Share2, ArrowUpRight } from 'lucide-react';

interface ReportActionsProps {
  shareText: string;
}

export default function ReportActions({ shareText }: ReportActionsProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadInfo = () => {
    alert(
      '💡 ¡Consejo de impresión!\n\nAl hacer clic en "Imprimir Póster de Búsqueda", se abrirá el diálogo de impresión de tu sistema. En la opción "Destino", selecciona "Guardar como PDF" para descargar el póster digital en alta calidad, listo para compartir en redes sociales.'
    );
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 no-print">
      {/* Compartir WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
      >
        <Share2 className="h-4.5 w-4.5" />
        <span>Compartir en WhatsApp</span>
      </a>

      {/* Imprimir Póster */}
      <button
        onClick={handlePrint}
        type="button"
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
      >
        <Printer className="h-4.5 w-4.5 text-lost" />
        <span>Imprimir Póster de Búsqueda</span>
      </button>

      {/* Descargar / PDF */}
      <button
        onClick={handleDownloadInfo}
        type="button"
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
      >
        <ArrowUpRight className="h-4.5 w-4.5" />
        <span>¿Cómo Descargar en PDF?</span>
      </button>
    </div>
  );
}
