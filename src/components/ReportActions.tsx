'use client';

import { Printer, Share2 } from 'lucide-react';

interface ReportActionsProps {
  shareText: string;
  shareUrl?: string;
  shareMessage?: string;
  compact?: boolean;
}

export default function ReportActions({
  shareText,
  shareUrl,
  shareMessage,
  compact = false,
}: ReportActionsProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleShareFacebook = () => {
    if (typeof window === 'undefined') return;

    const url = shareUrl || window.location.href;
    const quote = shareMessage || decodeURIComponent(shareText);
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(quote)}`;
    window.open(
      facebookShareUrl,
      'facebook-share',
      'noopener,noreferrer,width=640,height=720'
    );
  };

  return (
    <div className={`${compact ? 'grid grid-cols-1' : 'mt-6 grid grid-cols-1 sm:grid-cols-3'} gap-3 no-print`}>
      {/* Compartir WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${shareText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
      >
        <Share2 className="h-4.5 w-4.5" />
        <span>Compartir en WhatsApp</span>
      </a>

      {/* Compartir Facebook */}
      <button
        type="button"
        onClick={handleShareFacebook}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1877F2] hover:bg-[#0f62d6] text-white font-bold text-sm shadow-md transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="" viewBox="0 0 16 16">
          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
        </svg>
        <span>Compartir en Facebook</span>
      </button>

      {/* Imprimir Póster */}
      <button
        onClick={handlePrint}
        type="button"
        className="flex h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
      >
        <Printer className="h-4.5 w-4.5 text-lost" />
        <span>Imprimir Póster de Búsqueda</span>
      </button>

    </div>
  );
}
