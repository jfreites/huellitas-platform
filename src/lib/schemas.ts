import { z } from 'zod';

// Esquemas de Autenticación
export const requestOtpSchema = z.object({
  identifier: z.string().refine((val) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isPhone = /^\+?[1-9]\d{1,14}$/.test(val.replace(/[\s-()]/g, ''));
    return isEmail || isPhone;
  }, {
    message: 'Por favor, ingresa un correo electrónico válido o un número de teléfono con código de área (ej. +521234567890).',
  }),
});

export const verifyOtpSchema = z.object({
  identifier: z.string(),
  code: z.string().length(6, { message: 'El código debe tener exactamente 6 dígitos.' }),
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }).optional(),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }).optional(),
  contactPhone: z.string().min(8, { message: 'El número de contacto debe tener al menos 8 dígitos.' }).optional(),
});

// Esquemas de Reportes
// `imageUrl` se mantiene por retro-compatibilidad del schema, pero la subida
// real se hace directamente a Supabase Storage desde el cliente y el server
// action recibe `storagePath`.
export const reportBaseSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  species: z.enum(['DOG', 'CAT']),
  location: z.string().min(5, { message: 'La ubicación debe tener al menos 5 caracteres.' }),
  date: z.string().or(z.date()).refine((val) => {
    const d = new Date(val);
    return !isNaN(d.getTime()) && d <= new Date();
  }, {
    message: 'La fecha no puede ser en el futuro.',
  }),
  description: z.string().optional(),
  contactPhone: z.string().min(8, { message: 'El teléfono de contacto es obligatorio y debe tener al menos 8 dígitos.' }),
  imageUrl: z.string().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export const lostReportSchema = reportBaseSchema.extend({
  type: z.literal('LOST'),
  name: z.string().min(2, { message: 'El nombre de la mascota es obligatorio.' }),
  status: z.literal('LOST_ACTIVE').default('LOST_ACTIVE'),
  hasCollar: z.boolean().default(false),
  hasSpots: z.boolean().default(false),
  hasChip: z.boolean().default(false),
  hasScars: z.boolean().default(false),
  color: z.string().min(2, { message: 'El color de la mascota es obligatorio.' }),
  distinctiveText: z.string().optional(),
});

export const foundReportSchema = reportBaseSchema.extend({
  type: z.literal('FOUND'),
  status: z.enum(['IN_SHELTER', 'WANDERING', 'FOUND_DEAD']),
  name: z.string().optional(),
  hasCollar: z.boolean().default(false),
  hasSpots: z.boolean().default(false),
  hasChip: z.boolean().default(false),
  hasScars: z.boolean().default(false),
  color: z.string().optional(),
  distinctiveText: z.string().optional(),
});

export const reportFormSchema = z.discriminatedUnion('type', [
  lostReportSchema,
  foundReportSchema,
]);

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ReportFormInput = z.infer<typeof reportFormSchema>;
