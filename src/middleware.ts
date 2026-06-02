import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas de creación/edición de reportes
  if (pathname.startsWith('/reportes/nuevo')) {
    const session = request.cookies.get('huellitas_session')?.value;
    
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callback', pathname);
      return NextResponse.redirect(url);
    }
    
    const parsed = await decrypt(session);
    if (!parsed) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callback', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configurar qué rutas activan el middleware
export const config = {
  matcher: ['/reportes/nuevo/:path*', '/reportes/nuevo'],
};
