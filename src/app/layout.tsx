import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSession } from '@/lib/supabase/session';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '🐾 Huellitas - Reporta y Encuentra Mascotas Perdidas',
  description:
    'La plataforma más rápida y usable para reportar mascotas perdidas y encontradas. Conecta con protectores y dueños para lograr reencuentros felices.',
  keywords: ['mascotas', 'perros', 'gatos', 'perdidos', 'encontrados', 'veterinaria', 'animales', 'buscar mascota'],
  openGraph: {
    title: '🐾 Huellitas - Búsqueda de Mascotas',
    description: 'Encuentra o reporta perros y gatos extraviados en tu localidad de forma simple.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-lost selection:text-white">
        <Navbar session={session} />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
