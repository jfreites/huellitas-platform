'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { requestOtp, verifyOtp, loginWithMockOAuth } from '@/actions/auth';
import { ShieldCheck, Mail, Phone, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callback') || '/';

  // Estados de control
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isEmail, setIsEmail] = useState(true);
  const [requiresRegistration, setRequiresRegistration] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Campos de registro adicionales para usuarios nuevos
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Errores e indicaciones
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Solicitar OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!identifier.trim()) {
      setError('Por favor, ingresa tu correo electrónico o número telefónico.');
      return;
    }

    startTransition(async () => {
      const res = await requestOtp(identifier);
      if (res.success) {
        setIsEmail(res.isEmail!);
        setStep(2);
        setMessage(`Código enviado a ${res.identifier}. Revisa tu bandeja de entrada o consola del servidor.`);
      } else {
        setError(res.error || 'Error al solicitar el código.');
      }
    });
  };

  // Verificar OTP y registrar si es necesario
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!code.trim() || code.length !== 6) {
      setError('El código de verificación debe tener 6 dígitos.');
      return;
    }

    if (requiresRegistration && (!firstName.trim() || !lastName.trim() || !contactPhone.trim())) {
      setError('Por favor completa todos los datos de tu perfil.');
      return;
    }

    startTransition(async () => {
      const res = await verifyOtp({
        identifier,
        code,
        firstName: requiresRegistration ? firstName : undefined,
        lastName: requiresRegistration ? lastName : undefined,
        contactPhone: requiresRegistration ? contactPhone : undefined,
      });

      if (res.success) {
        if (res.requiresRegistration) {
          setRequiresRegistration(true);
          setMessage('¡Código correcto! Eres un usuario nuevo, por favor completa tu perfil para continuar.');
          // Si iniciamos sesión por teléfono, pre-poblar el teléfono de contacto
          if (!isEmail) {
            setContactPhone(identifier);
          }
        } else {
          router.refresh();
          router.push(callbackUrl);
        }
      } else {
        setError(res.error || 'Código incorrecto o expirado.');
      }
    });
  };

  // Iniciar con OAuth Mock (Google/Facebook)
  const handleMockOAuth = async (provider: 'google' | 'facebook') => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await loginWithMockOAuth(provider);
      if (res.success) {
        router.refresh();
        router.push(callbackUrl);
      } else {
        setError(res.error || 'Error al iniciar sesión con OAuth de demostración.');
      }
    });
  };

  return (
    <div className="flex flex-col flex-grow items-center justify-center bg-stone-50 dark:bg-stone-950/20 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-8 text-card-foreground shadow-md">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <span className="text-4xl block mb-2">🐾</span>
          <h2 className="text-2xl font-bold tracking-tight">Verifica tu Identidad</h2>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1">
            Requerimos verificación OTP rápida para asegurar reportes reales de mascotas y evitar fraudes.
          </p>
        </div>

        {/* Mensajes de feedback */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-3.5 text-xs sm:text-sm text-rose-700 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3.5 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Paso 1: Pedir Identificador */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                Correo Electrónico o Celular
              </label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3.5 h-4 w-4 text-foreground/45" />
                <input
                  id="identifier"
                  type="text"
                  placeholder="ejemplo@correo.com o +5215555555555"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-foreground/45 mt-1 leading-normal">
                Si ingresas teléfono, simula el SMS en la consola del servidor Next.js. El correo enviará un código real o demo según configuración.
              </p>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-lost hover:bg-rose-600 disabled:bg-rose-400 text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              {isPending ? 'Enviando código...' : 'Solicitar Código de Entrada'}
            </button>
          </form>
        )}

        {/* Paso 2: Verificar Código / Registro */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {/* Campo OTP */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-foreground/60">
                  Código de 6 dígitos
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setRequiresRegistration(false);
                  }}
                  className="inline-flex items-center gap-0.5 text-xs text-lost hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Cambiar correo/teléfono</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-3.5 h-4 w-4 text-foreground/45" />
                <input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-semibold tracking-[4px] text-center focus:border-lost focus:outline-none focus:ring-2 focus:ring-lost/15 transition-all"
                  required
                />
              </div>
            </div>

            {/* Formulario de registro adicional si es usuario nuevo */}
            {requiresRegistration && (
              <div className="space-y-3.5 pt-3.5 border-t border-border mt-3 animate-fadeIn">
                <h3 className="text-xs font-bold text-foreground/75 uppercase tracking-wide">Paso final: Completa tus datos</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground/60">Nombre</label>
                    <input
                      type="text"
                      placeholder="Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-lost focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground/60">Apellido</label>
                    <input
                      type="text"
                      placeholder="Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2 text-xs focus:border-lost focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {isEmail && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground/60">Número de Celular de Contacto</label>
                    <div className="relative">
                      <Phone className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-foreground/45" />
                      <input
                        type="tel"
                        placeholder="+5215555555555"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background py-2 pl-8.5 pr-2.5 text-xs focus:border-lost focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              {isPending ? 'Verificando...' : requiresRegistration ? 'Registrarse e Iniciar Sesión' : 'Verificar Código'}
            </button>
          </form>
        )}

        {/* Separador */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-card px-3 text-xs text-foreground/45 font-semibold uppercase tracking-wider">Demostración Rápida</span>
        </div>

        {/* OAuth Mocks - Para evaluar rápidamente el MVP sin configurar claves externas */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleMockOAuth('google')}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-900 py-3 text-xs sm:text-sm font-bold shadow-xs hover:border-foreground/20 transition-all active:scale-98"
          >
            {/* Google Icon SVG */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.98 1 12 1 7.24 1 3.23 3.73 1.25 7.73l3.85 3C6.01 7.73 8.79 5.04 12 5.04z"
              />
              <path
                fill="#4285F4"
                d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.69 2.87c2.16-1.99 3.74-4.92 3.74-8.55z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.73C4.86 14 4.73 13.06 4.73 12s.13-2 .37-2.73L1.25 6.27C.45 7.89 0 9.77 0 12c0 2.23.45 4.11 1.25 5.73l3.85-3z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.69-2.87c-1.02.69-2.33 1.1-4.27 1.1-3.21 0-5.99-2.69-6.9-5.69l-3.85 3C3.23 20.27 7.24 23 12 23z"
              />
            </svg>
            <span>Simular Login de Google OAuth</span>
          </button>

          <button
            onClick={() => handleMockOAuth('facebook')}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-900 py-3 text-xs sm:text-sm font-bold shadow-xs hover:border-foreground/20 transition-all active:scale-98 text-blue-600 dark:text-blue-400"
          >
            {/* Facebook Icon SVG */}
            <svg className="h-4.5 w-4.5 shrink-0 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
            </svg>
            <span>Simular Login de Facebook OAuth</span>
          </button>
        </div>

      </div>
    </div>
  );
}
