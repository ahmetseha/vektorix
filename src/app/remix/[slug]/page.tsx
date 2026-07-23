import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { decodeDNA } from "@/features/lab/engine/dna";
import { getSampleVektor } from "@/features/vektors/samples";
import { RemixExperience } from "@/features/remix/RemixExperience";

export default async function RemixPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ data?: string }> }) {
  const { slug } = await params;
  const query = await searchParams;
  let parent = getSampleVektor(slug)?.dna;
  if (query.data) { try { parent = decodeDNA(query.data); } catch { notFound(); } }
  if (!parent) notFound();
  return <><SiteHeader /><RemixExperience parent={parent} slug={slug} /></>;
}
