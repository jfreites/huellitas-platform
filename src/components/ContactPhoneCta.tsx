'use client';

import { Phone } from 'lucide-react';
import { maskContactPhone } from '@/lib/phone';

interface ContactPhoneCtaProps {
  phone: string;
}

/**
 * Big "tap to call" CTA. Currently a no-op: it doesn't navigate or
 * open the dialer. When the call-tracking / WhatsApp integration
 * lands, replace `handleClick` with the real action.
 */
export default function ContactPhoneCta({ phone }: ContactPhoneCtaProps) {
  const masked = maskContactPhone(phone);

  const handleClick = () => {
    // TODO: wire to tel: / WhatsApp deep-link / "Reveal number" flow.
  };

  return (
    <div className="rounded-2xl border-2 border-foreground bg-lost/5 dark:bg-lost/10 p-4 text-center">
      <label className="text-[10px] font-black uppercase tracking-widest text-lost">
        ¿Lo has visto? Comunícate de inmediato
      </label>
      <div className="flex items-center justify-center gap-2 mt-1">
        <Phone className="h-6 w-6 text-lost" />
        <button
          type="button"
          onClick={handleClick}
          aria-label="Llamar al dueño de la mascota"
          className="cursor-pointer text-2xl sm:text-3xl font-black text-foreground hover:underline tracking-tight focus:outline-none focus:ring-2 focus:ring-lost/40 rounded-md px-1"
        >
          {masked}
        </button>
      </div>
      <p className="text-[9px] text-foreground/50 mt-1 leading-normal">
        Reporte validado mediante OTP. Protegido contra suplantaciones.
      </p>
    </div>
  );
}
