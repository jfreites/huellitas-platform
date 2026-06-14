'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/service';
import { getSession } from '@/lib/supabase/session';
import { getPublicUrl } from '@/lib/supabase/storage';
import { generateReportQrDataUrl } from '@/lib/qr';
import { reportFormSchema } from '@/lib/schemas';
import type {
  PetSpecies,
  PetStatus,
  Report,
  ReportImage,
  ReportType,
} from '@/lib/supabase/types';

type ReportWithImages = Report & {
  images: (ReportImage & { publicUrl: string })[];
  user?: Report['user'];
};

function normalizeReport(row: any): ReportWithImages {
  const images = (row.images ?? []).map((img: any) => ({
    ...img,
    publicUrl: getPublicUrl(img.storage_path),
  }));
  return { ...row, images };
}

export async function createReport(formData: {
  storagePath: string;
  type: ReportType;
  species: PetSpecies;
  name: string;
  status?: PetStatus;
  hasCollar?: boolean;
  hasSpots?: boolean;
  hasChip?: boolean;
  hasScars?: boolean;
  color?: string;
  breed?: string;
  distinctiveText?: string;
  location: string;
  date: string;
  description?: string;
  contactPhone: string;
  latitude?: number | null;
  longitude?: number | null;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: 'No autorizado. Por favor inicia sesión primero.',
      };
    }

    const validated = reportFormSchema.parse({
      type: formData.type,
      species: formData.species,
      name: formData.name,
      status: formData.status,
      hasCollar: formData.hasCollar ?? false,
      hasSpots: formData.hasSpots ?? false,
      hasChip: formData.hasChip ?? false,
      hasScars: formData.hasScars ?? false,
      color: formData.color,
      breed: formData.breed,
      distinctiveText: formData.distinctiveText,
      location: formData.location,
      date: formData.date,
      description: formData.description,
      contactPhone: formData.contactPhone,
      imageUrl: formData.storagePath,
      latitude: formData.latitude ?? null,
      longitude: formData.longitude ?? null,
    });

    const supabase = await createClient();

    const status: PetStatus =
      validated.type === 'LOST'
        ? 'LOST_ACTIVE'
        : (validated.status as PetStatus);

    const { data: report, error } = await supabase
      .from('reports')
      .insert({
        user_id: session.user.id,
        type: validated.type,
        species: validated.species,
        name:
          validated.type === 'LOST'
            ? validated.name
            : validated.name || 'Mascota sin nombre',
        status,
        has_collar: validated.hasCollar ?? false,
        has_spots: validated.hasSpots ?? false,
        has_chip: validated.hasChip ?? false,
        has_scars: validated.hasScars ?? false,
        color: validated.color || 'No especificado',
        breed: validated.breed || 'No especificado',
        distinctive_text: validated.distinctiveText || null,
        location: validated.location,
        latitude: validated.latitude ?? null,
        longitude: validated.longitude ?? null,
        date: new Date(validated.date as any).toISOString(),
        description: validated.description || null,
        contact_phone: validated.contactPhone,
      } as never)
      .select('id')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    const reportRow = report as unknown as { id: string } | null;
    if (!reportRow) {
      throw new Error('No se pudo crear el reporte.');
    }

    const { error: imageError } = await supabase.from('report_images').insert({
      report_id: reportRow.id,
      storage_path: formData.storagePath,
      is_primary: true,
    } as never);

    if (imageError) {
      // Roll back the orphan report so the user can retry cleanly.
      await supabase.from('reports').delete().eq('id', reportRow.id);
      throw new Error(imageError.message);
    }

    try {
      const qrCodeDataUrl = await generateReportQrDataUrl(reportRow.id);
      const admin = getSupabaseAdmin();
      const { error: qrError } = await admin
        .from('reports')
        .update({ qr_code_data_url: qrCodeDataUrl } as never)
        .eq('id', reportRow.id);

      if (qrError) {
        console.error('Error al guardar QR del reporte:', qrError.message);
      }
    } catch (qrError) {
      console.error('Error al generar QR del reporte:', qrError);
    }

    revalidatePath('/');
    revalidatePath('/reportes');
    return { success: true, reportId: reportRow.id };
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    return {
      success: false,
      error: error.message || 'Error al guardar el reporte.',
    };
  }
}

export async function getReports(filters?: {
  species?: string;
  type?: string;
  status?: string;
  location?: string;
  search?: string;
}) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('reports')
      .select(
        '*, images:report_images(*), user:profiles(id, first_name, last_name, email, phone)'
      )
      .order('created_at', { ascending: false });

    if (filters?.species && filters.species !== 'ALL') {
      query = query.eq('species', filters.species as PetSpecies);
    }
    if (filters?.type && filters.type !== 'ALL') {
      query = query.eq('type', filters.type as ReportType);
    }
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status as PetStatus);
    }
    if (filters?.location && filters.location.trim() !== '') {
      query = query.ilike('location', `%${filters.location.trim()}%`);
    }
    if (filters?.search && filters.search.trim() !== '') {
      const term = `%${filters.search.trim()}%`;
      query = query.or(
        `name.ilike.${term},location.ilike.${term},color.ilike.${term},description.ilike.${term},distinctive_text.ilike.${term}`
      );
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return {
      success: true,
      reports: (data ?? []).map(normalizeReport),
    };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return {
      success: false,
      error: error.message || 'Error al consultar el catálogo.',
    };
  }
}

export async function getReportById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reports')
      .select(
        '*, images:report_images(*), user:profiles(id, first_name, last_name, email, phone)'
      )
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) {
      return { success: false, error: 'El reporte no existe o fue eliminado.' };
    }

    return { success: true, report: normalizeReport(data) };
  } catch (error: any) {
    console.error('Error al obtener reporte:', error);
    return {
      success: false,
      error: error.message || 'Error al cargar los detalles del reporte.',
    };
  }
}

export async function updateReportStatus(id: string, newStatus: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const admin = getSupabaseAdmin();
    const { data: report, error: fetchError } = await admin
      .from('reports')
      .select('user_id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!report) {
      return { success: false, error: 'Reporte no encontrado.' };
    }
    const reportRow = report as unknown as { user_id: string };
    if (reportRow.user_id !== session.user.id) {
      return {
        success: false,
        error: 'No tienes permisos para modificar este reporte.',
      };
    }

    const { data: updated, error } = await admin
      .from('reports')
      .update({ status: newStatus as PetStatus } as never)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/reportes');
    revalidatePath(`/reportes/${id}`);
    return { success: true, report: updated };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return {
      success: false,
      error: error.message || 'Error al actualizar el estado del reporte.',
    };
  }
}

export async function deleteReport(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    const admin = getSupabaseAdmin();
    const { data: report, error: fetchError } = await admin
      .from('reports')
      .select('user_id, images:report_images(storage_path)')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!report) {
      return { success: false, error: 'Reporte no encontrado.' };
    }
    const reportRow = report as unknown as {
      user_id: string;
      images: { storage_path: string }[] | null;
    };
    if (reportRow.user_id !== session.user.id) {
      return {
        success: false,
        error: 'No tienes permisos para eliminar este reporte.',
      };
    }

    const images = reportRow.images ?? [];
    if (images.length > 0) {
      const paths = images.map((i) => i.storage_path);
      await admin.storage.from('pet-images').remove(paths);
    }

    const { error } = await admin.from('reports').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/');
    revalidatePath('/reportes');
    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar reporte:', error);
    return {
      success: false,
      error: error.message || 'Error al eliminar el reporte.',
    };
  }
}

export async function uploadReportImage(formData: FormData) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return { success: false, error: 'Archivo no proporcionado.' };
    }

    const supabase = await createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${session.user.id}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('pet-images')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, storagePath };
  } catch (error: any) {
    console.error('Error al subir imagen:', error);
    return {
      success: false,
      error: error.message || 'Error al subir la imagen.',
    };
  }
}
