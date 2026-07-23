import type { VektorDNA } from "@/features/lab/schemas/dna";
import { clamp, createRandom } from "@/features/lab/engine/random";
import type { BiomeDefinition } from "../registries/biomes";
import type { GeneratedMemory } from "../schemas/memory";
import type { VektorState } from "../schemas/state";
import { vektorStateSchema } from "../schemas/state";

export type SimulationEvent = {
  type: "energy-shift" | "stability-shift" | "trait-signal";
  magnitude: number;
};

export type SimulationResult = {
  nextState: VektorState;
  generatedMemories: GeneratedMemory[];
  triggeredEvents: SimulationEvent[];
};

const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

export function simulateVektorState({
  dna,
  state,
  biome,
  elapsedTime,
  seed,
}: {
  dna: VektorDNA;
  state: VektorState;
  biome: BiomeDefinition;
  elapsedTime: number;
  seed: string;
}): SimulationResult {
  const safeElapsed = Math.max(0, Math.min(elapsedTime, MAX_ELAPSED_MS));
  const hours = safeElapsed / 3_600_000;
  const random = createRandom(`${dna.seed}:${state.lastSimulationAt}:${biome.id}:${seed}`);
  const affinity =
    dna.behavioral.preferredBiome === biome.id
      ? 1.2
      : biome.recommendedArchetypes.includes(dna.visual.archetype)
        ? 1.08
        : 0.92;
  const energyDelta =
    biome.environmentalRules.energyPerHour * hours * affinity * (0.92 + random() * 0.16);
  const stabilityResistance =
    biome.environmentalRules.stabilityPerHour < 0 ? 0.7 + dna.behavioral.stability * 0.3 : 1;
  const stabilityDelta =
    biome.environmentalRules.stabilityPerHour *
    hours *
    stabilityResistance *
    (0.92 + random() * 0.16);
  const nextAt = new Date(new Date(state.lastSimulationAt).getTime() + safeElapsed).toISOString();
  const nextState = vektorStateSchema.parse({
    ...state,
    currentBiome: biome.id,
    energy: clamp(state.energy + energyDelta),
    stability: clamp(state.stability + stabilityDelta),
    status: safeElapsed > 0 ? "active" : state.status,
    lastSimulationAt: nextAt,
    updatedAt: nextAt,
  });
  const generatedMemories: GeneratedMemory[] = [];
  const triggeredEvents: SimulationEvent[] = [];

  if (Math.abs(energyDelta) >= 0.02) {
    triggeredEvents.push({ type: "energy-shift", magnitude: energyDelta });
    generatedMemories.push({
      vektorId: state.vektorId,
      type: "energy-change",
      title: energyDelta > 0 ? "Energy gathered" : "Energy dispersed",
      description:
        energyDelta > 0
          ? `Its energy rose while moving through the ${biome.name}.`
          : `Its energy thinned while moving through the ${biome.name}.`,
      metadata: { version: 1, biome: biome.id, delta: energyDelta },
      importance: Math.min(0.7, 0.35 + Math.abs(energyDelta)),
      createdAt: nextAt,
    });
  }

  if (Math.abs(stabilityDelta) >= 0.02) {
    triggeredEvents.push({
      type: "stability-shift",
      magnitude: stabilityDelta,
    });
    generatedMemories.push({
      vektorId: state.vektorId,
      type: "stability-change",
      title: stabilityDelta > 0 ? "Signal settled" : "Signal fractured",
      description:
        stabilityDelta > 0
          ? `Its pulse settled inside the ${biome.name}.`
          : `Its pulse became less stable inside the ${biome.name}.`,
      metadata: { version: 1, biome: biome.id, delta: stabilityDelta },
      importance: Math.min(0.72, 0.38 + Math.abs(stabilityDelta)),
      createdAt: nextAt,
    });
  }

  if (hours >= 4 && random() < biome.environmentalRules.traitBias * dna.behavioral.adaptability) {
    triggeredEvents.push({
      type: "trait-signal",
      magnitude: biome.environmentalRules.traitBias,
    });
  }

  return { nextState, generatedMemories, triggeredEvents };
}
