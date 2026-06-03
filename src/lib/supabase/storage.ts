import 'server-only';
import { getSupabaseAdmin } from './service';

const BUCKET = 'pet-images';

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

export function getPublicUrl(storagePath: string): string {
  const supabase = getSupabaseAdmin();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

export function buildStoragePath(userId: string, fileName: string): string {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${userId}/${Date.now()}-${safeName}`;
}
