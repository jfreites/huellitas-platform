'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/actions/auth';
import type { Session } from '@/lib/supabase/session';
import { Menu, X, LogOut, PlusCircle, Search, User } from 'lucide-react';

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.refresh();
    router.push('/');
  };

  const firstName = session?.profile?.first_name ?? null;
  const lastName = session?.profile?.last_name ?? null;
  const email = session?.user.email ?? null;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight text-lost">
              <span>🐾</span>
              <span className="bg-gradient-to-r from-lost to-orange-500 bg-clip-text text-transparent">Huellitas</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/reportes" className="flex items-center space-x-1.5 text-sm font-medium hover:text-lost transition-colors">
              <Search className="h-4 w-4" />
              <span>Ver Mascotas</span>
            </Link>

            {session ? (
              <>
                <Link
                  href="/reportes/nuevo"
                  className="flex items-center space-x-1.5 rounded-full bg-lost px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition-colors shadow-sm hover:shadow-md active:scale-95"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Publicar Reporte</span>
                </Link>

                <div className="flex items-center space-x-3 pl-2 border-l border-border">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-semibold text-foreground/80">
                      {firstName || email || 'Usuario'}
                    </span>
                    <span className="text-[10px] text-foreground/50">
                      Conectado
                    </span>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-lost font-bold border border-border">
                    {firstName ? firstName[0].toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Cerrar sesión"
                    className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 text-foreground/65 hover:text-lost transition-colors"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-border hover:border-lost hover:bg-stone-50 dark:hover:bg-stone-900 px-5 py-2 text-sm font-semibold hover:text-lost transition-all active:scale-95"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-3">
          <Link
            href="/reportes"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-2 rounded-lg p-2.5 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Ver Mascotas Perdidas/Encontradas</span>
          </Link>

          {session ? (
            <>
              <Link
                href="/reportes/nuevo"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 rounded-lg bg-lost p-2.5 text-sm font-semibold text-white transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Publicar un Reporte</span>
              </Link>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-lost font-bold border border-border">
                    {firstName ? firstName[0].toUpperCase() : <User className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">
                      {firstName ? `${firstName} ${lastName ?? ''}`.trim() : email}
                    </span>
                    <span className="text-[10px] text-foreground/50">Sesión iniciada</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-1 text-xs font-semibold text-lost hover:bg-stone-50 dark:hover:bg-stone-900 p-2 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center rounded-lg border border-border p-2.5 text-sm font-semibold hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors text-center"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
