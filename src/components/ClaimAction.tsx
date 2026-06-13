'use client';

import { useState } from 'react'
import { Report } from '@/lib/supabase/types';
import { MessageCircle } from 'lucide-react';
import ClaimFormModal from './ClaimFormModal';

interface ClaimActionProps {
    report: Report;
}

export default function ClaimAction({ report }: ClaimActionProps) {
    const [open, setOpen] = useState(false)

    const buttonClassName = `h-4.5 w-4.5 ${report.type === 'FOUND' ? 'text-found' : 'text-lost'}`;

    return (
        <>

            <button
                onClick={() => setOpen(true)}
                type="button"
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl border border-foreground/35 bg-card hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
                <MessageCircle className={buttonClassName} />
                <span>{report.type === 'FOUND' ? 'Contactar a quien lo resguarda' : 'Avisar al dueño'}</span>
            </button>

            {open && (
                <ClaimFormModal reportId={report.id} onClose={() => setOpen(false)} />
            )}
        </>
    )
}
