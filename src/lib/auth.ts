import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'huellitas-super-secret-jwt-key-2026-mvp-high-security-token-value';
const key = new TextEncoder().encode(SECRET_KEY);

export interface SessionPayload {
  userId: string;
  email: string | null;
  phone: string | null;
  firstName?: string | null;
  lastName?: string | null;
  expires: string;
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('huellitas_session')?.value;
  if (!sessionToken) return null;
  return await decrypt(sessionToken);
}

export async function setSession(userId: string, email: string | null, phone: string | null, firstName?: string | null, lastName?: string | null) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  const session = await encrypt({ userId, email, phone, firstName, lastName, expires });
  
  const cookieStore = await cookies();
  cookieStore.set('huellitas_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('huellitas_session');
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get('huellitas_session')?.value;
  if (!session) return null;

  // Refrescar expiración del token si le queda poco
  const parsed = await decrypt(session);
  if (!parsed) return null;

  const res = NextResponse.next();
  // Solo re-firmar si expira pronto, o simplemente propagarlo en los headers
  return res;
}
