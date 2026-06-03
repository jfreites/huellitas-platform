'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requestOtpSchema } from '@/lib/schemas';
import { getSupabaseAdmin } from '@/lib/supabase/service';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

function detectChannel(identifier: string): 'email' | 'sms' {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? 'email' : 'sms';
}

export async function requestOtp(rawIdentifier: string) {
  try {
    const validated = requestOtpSchema.parse({ identifier: rawIdentifier });
    const identifier = validated.identifier.trim().toLowerCase();
    const channel = detectChannel(identifier);
    const supabase = await createClient();

    const { error } =
      channel === 'email'
        ? await supabase.auth.signInWithOtp({
            email: identifier,
            options: {
              shouldCreateUser: true,
              emailRedirectTo: `${APP_URL}/api/auth/callback`,
            },
          })
        : await supabase.auth.signInWithOtp({
            phone: identifier,
            options: {
              shouldCreateUser: true,
            },
          });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      isEmail: channel === 'email',
      identifier,
      channel,
      message:
        channel === 'email'
          ? `Te enviamos un código de verificación a ${identifier}. Revisa tu bandeja de entrada.`
          : `Te enviamos un código SMS a ${identifier}.`,
    };
  } catch (error: any) {
    console.error('Error en requestOtp:', error);
    return {
      success: false,
      error: error.message || 'Error al solicitar el código OTP.',
    };
  }
}

export async function verifyOtp(data: {
  identifier: string;
  code: string;
  firstName?: string;
  lastName?: string;
  contactPhone?: string;
}) {
  try {
    const identifier = data.identifier.trim().toLowerCase();
    const code = data.code.trim();
    const channel = detectChannel(identifier);
    const supabase = await createClient();

    const type = channel === 'email' ? 'email' : 'sms';

    const { data: sessionData, error } =
      channel === 'email'
        ? await supabase.auth.verifyOtp({
            email: identifier,
            token: code,
            type: 'email',
          })
        : await supabase.auth.verifyOtp({
            phone: identifier,
            token: code,
            type: 'sms',
          });

    if (error || !sessionData.user) {
      throw new Error(error?.message || 'Código incorrecto o expirado.');
    }

    const metadata: Record<string, any> = {};
    if (data.firstName) metadata.first_name = data.firstName;
    if (data.lastName) metadata.last_name = data.lastName;
    if (data.contactPhone && channel === 'email') {
      metadata.contact_phone = data.contactPhone;
    }

    if (Object.keys(metadata).length > 0) {
      await supabase.auth.updateUser({ data: metadata });
    }

    if (channel === 'email' && data.contactPhone) {
      const admin = getSupabaseAdmin();
      // Cast bypass: the local Database type stub doesn't satisfy the
      // postgrest-js GenericSchema constraint. Real production types
      // come from `supabase gen types typescript` and would type-check
      // without the cast.
      await admin
        .from('profiles')
        .update({ phone: data.contactPhone } as never)
        .eq('id', sessionData.user.id);
    }

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('Error en verifyOtp:', error);
    return {
      success: false,
      error: error.message || 'Error al verificar el código.',
    };
  }
}

export async function signInWithOAuth(
  provider: 'google' | 'facebook',
  redirectTo: string = '/'
) {
  const safeRedirect = redirectTo.startsWith('/') ? redirectTo : '/';
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${APP_URL}/api/auth/callback?next=${encodeURIComponent(safeRedirect)}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  return { success: true };
}
