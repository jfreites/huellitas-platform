import 'server-only';
import { cache } from 'react';
import { createClient } from './server';
import type { Profile } from './types';

export interface Session {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
  };
  profile: Profile | null;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
    },
    profile: (profile as Profile | null) ?? null,
  };
});
