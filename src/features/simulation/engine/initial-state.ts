import type { VektorDNA } from "@/features/lab/schemas/dna";
import type { BiomeType } from "../schemas/biome";
import type { GeneratedMemory } from "../schemas/memory";
import type { VektorState } from "../schemas/state";
import { vektorStateSchema } from "../schemas/state";
import { getBiomeDefinition } from "../registries/biomes";
import { clamp } from "@/features/lab/engine/random";

export function createInitialVektorState({
  vektorId,
  dna,
  biome,
  releasedAt,
}: {
  vektorId: string;
  dna: VektorDNA;
  biome: BiomeType;
  releasedAt: string;
}): VektorState {
  const definition = getBiomeDefinition(biome);
  const affinity =
    biome === dna.behavioral.preferredBiome
      ? 0.08
      : definition.recommendedArchetypes.includes(dna.visual.archetype)
        ? 0.04
        : 0;

  return vektorStateSchema.parse({
    vektorId,
    currentBiome: biome,
    energy: clamp(0.58 + dna.visual.gesture.intensity * 0.22 + affinity),
    stability: clamp(0.5 + dna.behavioral.stability * 0.34 + affinity),
    evolutionPath: null,
    evolutionStage: 0,
    activeMutationId: null,
    status: "active",
    lastSimulationAt: releasedAt,
    updatedAt: releasedAt,
  });
}

export function createReleaseMemories({
  vektorId,
  biome,
  createdAt,
}: {
  vektorId: string;
  biome: BiomeType;
  createdAt: string;
}): GeneratedMemory[] {
  const definition = getBiomeDefinition(biome);
  return [
    {
      vektorId,
      type: "awakened",
      title: "Awakened",
      description: "Awakened in the Digital Life Lab.",
      metadata: { version: 1 },
      importance: 0.9,
      createdAt,
    },
    {
      vektorId,
      type: "released",
      title: `Released into ${definition.name}`,
      description: `Released into the ${definition.name}.`,
      metadata: { version: 1, biome },
      importance: 1,
      createdAt,
    },
  ];
}
