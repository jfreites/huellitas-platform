'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateReportStatus, deleteReport } from '@/actions/reports';
import { Award, Check, Trash2 } from 'lucide-react';

interface OwnerControlsProps {
  reportId: string;
  isReunited: boolean;
}

export default function OwnerControls({ reportId, isReunited }: OwnerControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMarkReunited = () => {
    if (confirm('¿Confirmas que la mascota ha sido reunida con su familia? ¡Felicidades! 🎉')) {
      startTransition(async () => {
        const res = await updateReportStatus(reportId, 'REUNITED');
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || 'Error al cambiar estatus.');
        }
      });
    }
  };

  const handleDelete = () => {
    if (confirm('🚨 ¿Estás 100% seguro de que deseas eliminar este reporte de forma permanente? Esta acción no se puede deshacer.')) {
      startTransition(async () => {
        const res = await deleteReport(reportId);
        if (res.success) {
          router.push('/reportes');
          router.refresh();
        } else {
          alert(res.error || 'Error al eliminar reporte.');
        }
      });
    }
  };

  return (
    <div className="mb-8 rounded-2xl border-2 border-dashed border-lost/30 bg-lost/5 p-4 sm:p-5 no-print animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-lost flex items-center gap-1.5">
            <Award className="h-5 w-5" />
            <span>Panel de Control de tu Reporte</span>
          </h3>
          <p className="text-xs text-foreground/60 mt-1 leading-normal">
            Tú creaste esta publicación. Puedes cambiar el estatus cuando se logre el reencuentro o eliminarla de forma definitiva.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {!isReunited && (
            <button
              onClick={handleMarkReunited}
              disabled={isPending}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-4 py-2 text-xs font-bold shadow-md cursor-pointer transition-colors"
            >
              <Check className="h-4.5 w-4.5" />
              <span>¡Reunido con Familia!</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isPending}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 px-4 py-2 text-xs font-bold border border-rose-200 dark:border-rose-900/50 cursor-pointer transition-colors"
          >
            <Trash2 className="h-4.5 w-4.5" />
            <span>Eliminar Reporte</span>
          </button>
        </div>
      </div>
    </div>
  );
}
