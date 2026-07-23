import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeDNA } from "@/features/lab/engine/dna";
import { FieldExperience } from "@/features/field/components/FieldExperience";
import { getBiomeDefinition } from "@/features/simulation/registries/biomes";
import { biomeTypeSchema, type BiomeType } from "@/features/simulation/schemas/biome";
import { createEphemeralVektorRecord } from "@/features/vektors/create-ephemeral-record";
import { getSampleVektor } from "@/features/vektors/samples";
import { vektorRepository } from "@/server/services/vektor-repository";

type Props = {
  params: Promise<{ biome: string }>;
  searchParams: Promise<{ slug?: string; data?: string; name?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const parsed = biomeTypeSchema.safeParse((await params).biome);
  if (!parsed.success) return { title: "Unknown Field" };
  const biome = getBiomeDefinition(parsed.data);
  return { title: biome.name, description: biome.description };
}

export default async function BiomeFieldPage({ params, searchParams }: Props) {
  const parsed = biomeTypeSchema.safeParse((await params).biome);
  if (!parsed.success) notFound();
  const biome = parsed.data as BiomeType;
  const query = await searchParams;
  let record = query.slug
    ? ((await vektorRepository.get(query.slug)) ?? getSampleVektor(query.slug))
    : undefined;

  if (!record && query.data) {
    try {
      const dna = decodeDNA(query.data);
      record = createEphemeralVektorRecord({
        slug: query.slug ?? `shared-${dna.seed.slice(0, 12)}`,
        name: query.name ? decodeURIComponent(query.name) : "Shared Vektor",
        dna,
        biome,
      });
    } catch {
      notFound();
    }
  }
  if (!record) notFound();
  return <FieldExperience initialRecord={record} biome={biome} />;
}
