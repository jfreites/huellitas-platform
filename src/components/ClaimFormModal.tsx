'use client';

import { useActionState, useCallback } from 'react'
import { createContactRequest } from '@/actions/contact';
import { Send } from 'lucide-react';

const initialState = {
    success: false,
    error: '',
}

export default function ClaimFormModal({
    reportId,
    onClose,
}: {
    reportId: string;
    onClose: () => void;
}) {
    const [state, formAction, pending] = useActionState(
        createContactRequest,
        initialState
    )
    const setRenderedAtInput = useCallback((node: HTMLInputElement | null) => {
        if (node && !node.value) {
            node.value = String(Date.now())
        }
    }, [])

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                    <h2 className="mb-4 text-xl font-semibold">
                        Envía un mensaje
                    </h2>
                    <p className="mb-4 text-sm text-stone-600">
                        Comparte tus datos para que podamos notificar al responsable del reporte sin exponer su información privada.
                    </p>
                    <form action={formAction} className="space-y-4">
                        <input type="hidden" name="reportId" value={reportId} />
                        <input
                            type="hidden"
                            name="renderedAt"
                            ref={setRenderedAtInput}
                        />
                        <div className="hidden" aria-hidden="true">
                            <label htmlFor="contact-website">Sitio web</label>
                            <input
                                id="contact-website"
                                name="website"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <input
                            name="name"
                            type="text"
                            placeholder="Nombre"
                            autoComplete="name"
                            required
                            className="w-full rounded-md border px-3 py-2"
                        />

                        <input
                            name="contact"
                            type="text"
                            placeholder="Email o teléfono"
                            autoComplete="email tel"
                            required
                            className="w-full rounded-md border px-3 py-2"
                        />

                        <textarea
                            name="message"
                            placeholder="Mensaje opcional"
                            rows={4}
                            className="w-full rounded-md border px-3 py-2"
                        />

                        {state.error && (
                            <p className="text-sm text-red-600">
                                {state.error}
                            </p>
                        )}

                        {state.success && (
                            <p className="text-sm text-green-600">
                                Mensaje enviado correctamente.
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-md border px-4 py-2"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={pending}
                                className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
                            >
                                <Send size={12} />
                                <span>{pending ? 'Enviando...' : 'Enviar'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
