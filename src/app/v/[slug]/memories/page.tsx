import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { decodeDNA } from "@/features/lab/engine/dna";
import { createEphemeralVektorRecord } from "@/features/vektors/create-ephemeral-record";
import { MemoryTimeline } from "@/features/vektors/MemoryTimeline";
import { getSampleVektor } from "@/features/vektors/samples";
import { vektorRepository } from "@/server/services/vektor-repository";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ data?: string; name?: string }>;
};

export const metadata: Metadata = {
  title: "Memories",
  description: "A readable timeline of a Vektor's life in the Field.",
};

export default async function VektorMemoriesPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  let record = vektorRepository.get(slug) ?? getSampleVektor(slug);
  if (!record && query.data) {
    try {
      record = createEphemeralVektorRecord({
        slug,
        name: query.name ? decodeURIComponent(query.name) : "Shared Vektor",
        dna: decodeDNA(query.data),
      });
    } catch {
      notFound();
    }
  }
  if (!record) notFound();
  return (
    <>
      <SiteHeader />
      <MemoryTimeline record={record} />
    </>
  );
}
