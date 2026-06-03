import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reportes`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const supabase = await createClient();
    const { data: reports, error } = await supabase
      .from('reports')
      .select('id, updated_at');

    if (error) throw error;

    const dynamicRoutes: MetadataRoute.Sitemap = (reports ?? []).map(
      (r: any) => ({
        url: `${baseUrl}/reportes/${r.id}`,
        lastModified: new Date(r.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    );

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Fallo al generar rutas dinámicas del sitemap:', error);
    return staticRoutes;
  }
}
