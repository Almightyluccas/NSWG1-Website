import { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nswg1.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicPages = ["/", "/about", "/gallery", "/units/tf160th", "/units/tacdevron2"];

  return publicPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    priority: 1.0,
  }));
}
