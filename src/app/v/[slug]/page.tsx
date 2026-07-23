import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { decodeDNA } from "@/features/lab/engine/dna";
import { getSampleVektor } from "@/features/vektors/samples";
import { VektorDetail } from "@/features/vektors/VektorDetail";
import { createEphemeralVektorRecord } from "@/features/vektors/create-ephemeral-record";
import { vektorRepository } from "@/server/services/vektor-repository";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ data?: string; name?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const query = await searchParams;
  const record = vektorRepository.get(slug) ?? getSampleVektor(slug);
  const name = query.name ? decodeURIComponent(query.name) : (record?.name ?? "Unknown Vektor");
  const description =
    record?.description ?? "A living deterministic organism shaped in the Vektorix lab.";
  const socialImage = `/v/${slug}/opengraph-image`;
  return {
    title: name,
    description,
    alternates: { canonical: `/v/${slug}` },
    openGraph: { title: `${name} — Vektorix`, description, type: "website", images: [socialImage] },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Vektorix`,
      description,
      images: [socialImage],
    },
  };
}

export default async function VektorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  let record = vektorRepository.get(slug) ?? getSampleVektor(slug);
  if (!record && query.data) {
    try {
      const dna = decodeDNA(query.data);
      record = createEphemeralVektorRecord({
        slug,
        name: query.name ? decodeURIComponent(query.name) : "Shared Vektor",
        dna,
      });
    } catch {
      notFound();
    }
  }
  if (!record) notFound();
  return (
    <>
      <SiteHeader />
      <VektorDetail initialRecord={record} />
    </>
  );
}
