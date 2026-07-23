import type { MetadataRoute } from "next";
import { sampleVektors } from "@/features/vektors/samples";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const routes = ["", "/lab", "/field", "/explore"];
  return [
    ...routes.map((route) => ({ url: `${origin}${route}`, changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.8 })),
    ...sampleVektors.map((vektor) => ({ url: `${origin}/v/${vektor.slug}`, lastModified: vektor.createdAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...sampleVektors.map((vektor) => ({ url: `${origin}/v/${vektor.slug}/memories`, lastModified: vektor.createdAt, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
