import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Rutas estáticas básicas
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reportes`,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Rutas dinámicas de reportes de mascotas
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const dynamicRoutes = reports.map((report) => ({
      url: `${baseUrl}/reportes/${report.id}`,
      lastModified: new Date(report.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Fallo al generar rutas dinámicas del sitemap:', error);
    return staticRoutes;
  }
}
