
import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = [
    '/',
    '/about',
    '/gallery',
    '/tf160th',
    '/tacdevron2'
  ];



  return publicPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    priority: 1.0,
  }));
}