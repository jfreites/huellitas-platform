'use client';

import { useActionState } from 'react'
import { createContactRequest } from '@/actions/contact';
import { Send } from 'lucide-react';

const initialState = {
    success: false,
    error: '',
}

export default function ClaimFormModal({ onClose }: { onClose: () => void }) {
    const [state, formAction, pending] = useActionState(
        createContactRequest,
        initialState
    )

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
                    <form action={formAction} className="space-y-4">
                        <input
                            name="name"
                            type="text"
                            placeholder="Nombre"
                            className="w-full rounded-md border px-3 py-2"
                        />

                        <input
                            name="contact"
                            type="text"
                            placeholder="Email o teléfono"
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