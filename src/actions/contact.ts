'use server';

import { createHash } from 'crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/service';
import { sendTransactionalEmail } from '@/lib/email';

const INTERNAL_NOTIFY_EMAIL = 'jonathanfreites@gmail.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MIN_SUBMIT_DELAY_MS = 2500;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

type ContactFormState = {
  success: boolean;
  error: string;
};

type ReportContactRow = {
  id: string;
  user_id: string;
  type: 'LOST' | 'FOUND';
  species: 'DOG' | 'CAT';
  name: string | null;
  location: string;
  contact_phone: string | null;
  user:
    | {
        id: string;
        email: string | null;
        phone: string | null;
        first_name: string | null;
        last_name: string | null;
      }
    | null;
};

const contactRequestSchema = z.object({
  reportId: z.string().uuid('El reporte no es válido.'),
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(120, 'El nombre es demasiado largo.'),
  contact: z
    .string()
    .trim()
    .min(5, 'Ingresa un email o teléfono válido.')
    .max(160, 'El contacto es demasiado largo.'),
  message: z
    .string()
    .trim()
    .max(1000, 'El mensaje no puede superar 1000 caracteres.')
    .optional(),
  website: z.string().trim().optional(),
  renderedAt: z.string().trim().optional(),
});

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitContact(contact: string) {
  const normalized = normalizeSpaces(contact);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? normalized.toLowerCase()
    : null;
  const phone = /^\+?[1-9]\d{1,14}$/.test(normalized.replace(/[\s-()]/g, ''))
    ? normalized
    : null;

  return { normalized, email, phone };
}

function isSuspiciousTiming(renderedAt: string | undefined) {
  if (!renderedAt) return false;
  const timestamp = Number(renderedAt);
  if (!Number.isFinite(timestamp)) return true;
  return Date.now() - timestamp < MIN_SUBMIT_DELAY_MS;
}

function getClientIp(headersList: Headers) {
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return (
    headersList.get('x-real-ip') ||
    headersList.get('cf-connecting-ip') ||
    'unknown'
  );
}

function hashIp(ip: string) {
  const salt = process.env.CONTACT_REQUEST_IP_SALT || 'huellitas-contact';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

function escapeHtml(value: string | null | undefined) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReportLabel(report: ReportContactRow) {
  const type = report.type === 'LOST' ? 'perdida' : 'encontrada';
  const species = report.species === 'DOG' ? 'perro' : 'gato';
  return `${report.name || species} (${type})`;
}

function buildOwnerEmailHtml(params: {
  report: ReportContactRow;
  requesterName: string;
  requesterContact: string;
  requesterMessage: string;
  reportUrl: string;
}) {
  const { report, requesterName, requesterContact, requesterMessage, reportUrl } =
    params;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; color: #1c1917;">
      <h1 style="font-size: 22px;">Tienes una solicitud de contacto en Huellitas</h1>
      <p>Alguien envió información sobre el reporte <strong>${escapeHtml(buildReportLabel(report))}</strong>.</p>
      <div style="border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px; margin: 16px 0;">
        <p><strong>Nombre:</strong> ${escapeHtml(requesterName)}</p>
        <p><strong>Contacto:</strong> ${escapeHtml(requesterContact)}</p>
        ${requesterMessage ? `<p><strong>Mensaje:</strong><br>${escapeHtml(requesterMessage).replace(/\n/g, '<br>')}</p>` : ''}
      </div>
      <p><strong>Reporte:</strong> <a href="${escapeHtml(reportUrl)}">${escapeHtml(reportUrl)}</a></p>
      <p style="font-size: 12px; color: #78716c;">Huellitas no verifica la identidad de quien escribe. Coordina el encuentro con cuidado y evita compartir códigos o dinero.</p>
    </div>
  `;
}

function buildInternalEmailHtml(params: {
  report: ReportContactRow;
  requesterName: string;
  requesterContact: string;
  requesterMessage: string;
  reportUrl: string;
}) {
  const { report, requesterName, requesterContact, requesterMessage, reportUrl } =
    params;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 620px; color: #1c1917;">
      <h1 style="font-size: 22px;">Nueva solicitud de contacto</h1>
      <p>El reporte <strong>${escapeHtml(report.id)}</strong> recibió una solicitud.</p>
      <ul>
        <li><strong>Mascota:</strong> ${escapeHtml(buildReportLabel(report))}</li>
        <li><strong>Ubicación:</strong> ${escapeHtml(report.location)}</li>
        <li><strong>Dueño:</strong> ${escapeHtml(report.user?.email || 'sin email')} / ${escapeHtml(report.user?.phone || report.contact_phone || 'sin teléfono')}</li>
        <li><strong>Solicitante:</strong> ${escapeHtml(requesterName)}</li>
        <li><strong>Contacto solicitante:</strong> ${escapeHtml(requesterContact)}</li>
      </ul>
      ${requesterMessage ? `<p><strong>Mensaje:</strong><br>${escapeHtml(requesterMessage).replace(/\n/g, '<br>')}</p>` : ''}
      <p><a href="${escapeHtml(reportUrl)}">Abrir reporte</a></p>
    </div>
  `;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error desconocido.';
}

async function isRateLimited(reportId: string, ipHash: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const admin = getSupabaseAdmin();
  const { count, error } = await admin
    .from('contact_requests')
    .select('id', { count: 'exact', head: true })
    .eq('report_id', reportId)
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  if (error) throw new Error(error.message);
  return (count ?? 0) >= RATE_LIMIT_MAX_REQUESTS;
}

export async function createContactRequest(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  void prevState;

  try {
    const parsed = contactRequestSchema.safeParse({
      reportId: formData.get('reportId'),
      name: formData.get('name'),
      contact: formData.get('contact'),
      message: formData.get('message') || undefined,
      website: formData.get('website') || undefined,
      renderedAt: formData.get('renderedAt') || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Revisa los datos enviados.',
      };
    }

    const { reportId, website, renderedAt } = parsed.data;
    if (website || isSuspiciousTiming(renderedAt)) {
      return { success: true, error: '' };
    }

    const name = normalizeSpaces(parsed.data.name);
    const { normalized: contact, email, phone } = splitContact(parsed.data.contact);
    if (!email && !phone) {
      return {
        success: false,
        error: 'Ingresa un email válido o un teléfono con código de país.',
      };
    }

    const message = parsed.data.message
      ? normalizeSpaces(parsed.data.message)
      : '';
    const headersList = await headers();
    const ipHash = hashIp(getClientIp(headersList));
    const userAgent = (headersList.get('user-agent') || 'unknown').slice(0, 500);

    if (await isRateLimited(reportId, ipHash)) {
      return {
        success: false,
        error:
          'Recibimos varias solicitudes recientes para este reporte. Inténtalo de nuevo más tarde.',
      };
    }

    const admin = getSupabaseAdmin();
    const { data, error: reportError } = await admin
      .from('reports')
      .select(
        'id, user_id, type, species, name, location, contact_phone, user:profiles(id, email, phone, first_name, last_name)'
      )
      .eq('id', reportId)
      .maybeSingle();

    if (reportError) throw new Error(reportError.message);
    if (!data) {
      return {
        success: false,
        error: 'No encontramos el reporte. Es posible que haya sido eliminado.',
      };
    }

    const report = data as unknown as ReportContactRow;
    const { error: insertError } = await admin.from('contact_requests').insert({
      report_id: report.id,
      report_owner_id: report.user_id,
      requester_name: name,
      requester_contact: contact,
      requester_message: message || null,
      requester_email: email,
      requester_phone: phone,
      ip_hash: ipHash,
      user_agent: userAgent,
    } as never);

    if (insertError) throw new Error(insertError.message);

    const reportUrl = `${APP_URL}/reportes/${report.id}`;
    const ownerEmail = report.user?.email;
    if (ownerEmail) {
      const ownerResult = await sendTransactionalEmail({
        to: ownerEmail,
        subject: `Huellitas: solicitud de contacto para ${buildReportLabel(report)}`,
        html: buildOwnerEmailHtml({
          report,
          requesterName: name,
          requesterContact: contact,
          requesterMessage: message,
          reportUrl,
        }),
        text: `Nueva solicitud para ${buildReportLabel(report)}. Nombre: ${name}. Contacto: ${contact}. Mensaje: ${message || 'Sin mensaje'}. Reporte: ${reportUrl}`,
      });
      if (!ownerResult.success) {
        console.error('[contact request] Error enviando email al dueño:', ownerResult.error);
      }
    }

    const ownerPhone = report.user?.phone || report.contact_phone;
    if (ownerPhone) {
      console.log('[CONTACT PHONE MOCK]', {
        to: ownerPhone,
        reportId: report.id,
        requesterName: name,
        requesterContact: contact,
      });
    }

    const internalResult = await sendTransactionalEmail({
      to: INTERNAL_NOTIFY_EMAIL,
      subject: `Huellitas: reporte ${report.id} tuvo una solicitud de contacto`,
      html: buildInternalEmailHtml({
        report,
        requesterName: name,
        requesterContact: contact,
        requesterMessage: message,
        reportUrl,
      }),
      text: `Reporte ${report.id} recibió una solicitud. Solicitante: ${name}. Contacto: ${contact}. Mensaje: ${message || 'Sin mensaje'}. ${reportUrl}`,
    });
    if (!internalResult.success) {
      console.error('[contact request] Error enviando email interno:', internalResult.error);
    }

    return { success: true, error: '' };
  } catch (error: unknown) {
    console.error('Error en createContactRequest:', error);
    const message = getErrorMessage(error);
    if (message.includes('contact_requests')) {
      console.error(
        'La tabla contact_requests no parece estar configurada. Ejecuta el SQL en docs/SUPABASE_SETUP.md.'
      );
    }
    return {
      success: false,
      error:
        'No pudimos enviar la solicitud en este momento. Inténtalo de nuevo más tarde.',
    };
  }
}
