import type { VektorDNA } from "@/features/lab/schemas/dna";
import {
  createInitialVektorState,
  createReleaseMemories,
} from "@/features/simulation/engine/initial-state";
import type { BiomeType } from "@/features/simulation/schemas/biome";
import type { VektorRecord } from "./types";

export function createEphemeralVektorRecord({
  slug,
  name,
  dna,
  biome = dna.behavioral.preferredBiome,
  createdAt = new Date().toISOString(),
}: {
  slug: string;
  name: string;
  dna: VektorDNA;
  biome?: BiomeType;
  createdAt?: string;
}): VektorRecord {
  const id = `shared:${slug}`;
  return {
    id,
    slug,
    name,
    description: "A deterministic signal shared from the Vektorix field.",
    creator: "Anonymous researcher",
    dna,
    createdAt,
    releasedAt: createdAt,
    reactionCount: 0,
    remixCount: 0,
    generation: dna.ancestry?.generation ?? 1,
    state: createInitialVektorState({
      vektorId: id,
      dna,
      biome,
      releasedAt: createdAt,
    }),
    memories: createReleaseMemories({
      vektorId: id,
      biome,
      createdAt,
    })
      .map((memory, index) => ({
        ...memory,
        id: `${id}:memory:${index + 1}`,
      }))
      .reverse(),
  };
}
