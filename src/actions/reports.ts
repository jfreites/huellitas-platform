'use server';

import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { reportFormSchema } from '@/lib/schemas';
import { ReportType, PetSpecies, PetStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Helper para guardar imágenes localmente (fallback para desarrollo) o en base de datos
async function saveImage(base64Data: string): Promise<string> {
  if (!base64Data.startsWith('data:image/')) {
    // Si no es un base64 data URL, asumimos que es una URL remota de ejemplo
    return base64Data;
  }

  try {
    // Extraer datos limpios
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Formato base64 inválido');
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const extension = matches[1].split('/')[1] || 'jpg';
    const filename = `pet-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    
    // Ruta en el directorio public
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');

    // Intentar guardar localmente en public/uploads si estamos en entorno local de desarrollo
    if (fs.existsSync(publicDir)) {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, imageBuffer);
      return `/uploads/${filename}`;
    }
  } catch (error) {
    console.warn('Advertencia: No se pudo guardar la imagen en disco (típico en Vercel Serverless). Guardando base64 directamente en la base de datos.', error);
  }

  // Si falla el guardado local o estamos en Vercel Serverless sin filesystem persistente,
  // guardamos el base64 directamente en la base de datos para garantizar que funcione al 100%
  return base64Data;
}

export async function createReport(formData: any) {
  try {
    // Verificar sesión
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado. Por favor inicia sesión primero.' };
    }

    // Validar esquema Zod
    const validated = reportFormSchema.parse(formData);

    // Procesar y guardar la foto principal
    const imageUrl = await saveImage(validated.imageUrl);

    const val = validated as any;

    // Guardar en la base de datos con Prisma
    const report = await prisma.report.create({
      data: {
        userId: session.userId,
        type: val.type as ReportType,
        species: val.species as PetSpecies,
        name: val.type === 'LOST' ? val.name : val.name || 'Mascota sin nombre',
        status: (val.status || (val.type === 'LOST' ? 'LOST_ACTIVE' : 'IN_SHELTER')) as PetStatus,
        hasCollar: val.hasCollar || false,
        hasSpots: val.hasSpots || false,
        hasChip: val.hasChip || false,
        hasScars: val.hasScars || false,
        color: val.color || 'No especificado',
        distinctiveText: val.distinctiveText || '',
        location: val.location,
        date: new Date(val.date),
        description: val.description || '',
        contactPhone: val.contactPhone,
        images: {
          create: [
            {
              url: imageUrl,
              isPrimary: true,
            },
          ],
        },
      },
      include: {
        images: true,
      },
    });

    return { success: true, reportId: report.id };
  } catch (error: any) {
    console.error('Error al crear reporte:', error);
    return { success: false, error: error.message || 'Error al guardar el reporte en la base de datos.' };
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
    const whereClause: any = {};

    if (filters) {
      if (filters.species && filters.species !== 'ALL') {
        whereClause.species = filters.species as PetSpecies;
      }
      if (filters.type && filters.type !== 'ALL') {
        whereClause.type = filters.type as ReportType;
      }
      if (filters.status && filters.status !== 'ALL') {
        whereClause.status = filters.status as PetStatus;
      }
      if (filters.location && filters.location.trim() !== '') {
        whereClause.location = {
          contains: filters.location,
          mode: 'insensitive',
        };
      }
      if (filters.search && filters.search.trim() !== '') {
        whereClause.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { location: { contains: filters.search, mode: 'insensitive' } },
          { color: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { distinctiveText: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        images: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { success: true, reports };
  } catch (error: any) {
    console.error('Error al obtener reportes:', error);
    return { success: false, error: error.message || 'Error al consultar el catálogo.' };
  }
}

export async function getReportById(id: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        images: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!report) {
      return { success: false, error: 'El reporte no existe o fue eliminado.' };
    }

    return { success: true, report };
  } catch (error: any) {
    console.error('Error al obtener reporte:', error);
    return { success: false, error: error.message || 'Error al cargar los detalles del reporte.' };
  }
}

export async function updateReportStatus(id: string, newStatus: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado.' };
    }

    if (report.userId !== session.userId) {
      return { success: false, error: 'No tienes permisos para modificar este reporte.' };
    }

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: newStatus as PetStatus,
      },
    });

    return { success: true, report: updated };
  } catch (error: any) {
    console.error('Error al actualizar estado:', error);
    return { success: false, error: error.message || 'Error al actualizar el estado del reporte.' };
  }
}

export async function deleteReport(id: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: 'No autorizado.' };
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!report) {
      return { success: false, error: 'Reporte no encontrado.' };
    }

    if (report.userId !== session.userId) {
      return { success: false, error: 'No tienes permisos para eliminar este reporte.' };
    }

    await prisma.report.delete({
      where: { id },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error al eliminar reporte:', error);
    return { success: false, error: error.message || 'Error al eliminar el reporte.' };
  }
}
