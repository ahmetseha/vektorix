import type { Archetype, BehavioralDNA, VisualDNA } from "../schemas/dna";
import { behavioralDnaSchema } from "../schemas/dna";
import type { BiomeType, EnergyAffinity } from "@/features/simulation/schemas/biome";
import { clamp } from "./random";

const archetypeAffinity: Record<
  Archetype,
  { biome: BiomeType; energy: EnergyAffinity; territoriality: number }
> = {
  calm: {
    biome: "silent-ocean",
    energy: "resonant",
    territoriality: 0.08,
  },
  chaotic: {
    biome: "crystal-rift",
    energy: "volatile",
    territoriality: 0.22,
  },
  electric: {
    biome: "electric-storm",
    energy: "kinetic",
    territoriality: 0.16,
  },
  organic: {
    biome: "void-garden",
    energy: "adaptive",
    territoriality: 0.1,
  },
};

export function deriveBehavioralDNA(seed: string, visual: VisualDNA): BehavioralDNA {
  const gesture = visual.gesture;
  const affinity = archetypeAffinity[visual.archetype];
  const outward = Math.max(0, gesture.radialBias);
  const inward = Math.max(0, -gesture.radialBias);
  const calmControl =
    (1 - gesture.averageSpeed) * 0.55 +
    (1 - gesture.averageCurvature) * 0.25 +
    (1 - gesture.intensity) * 0.2;

  const preferredBiome =
    gesture.variety > 0.78 && visual.archetype !== "electric"
      ? "crystal-rift"
      : gesture.averageCurvature > 0.7 && visual.archetype === "calm"
        ? "silent-ocean"
        : affinity.biome;

  return behavioralDnaSchema.parse({
    curiosity: clamp(
      gesture.averageSpeed * 0.5 +
        outward * 0.22 +
        gesture.variety * 0.2 +
        gesture.intensity * 0.08,
    ),
    sociability: clamp(
      gesture.averageCurvature * 0.45 +
        visual.motion.orbitStrength * 0.35 +
        (1 - Math.abs(gesture.radialBias)) * 0.2,
    ),
    stability: clamp(calmControl),
    adaptability: clamp(
      gesture.variety * 0.62 + visual.motion.elasticity * 0.25 + gesture.averageCurvature * 0.13,
    ),
    territoriality: clamp(
      gesture.averageCurvature * 0.42 + outward * 0.28 + affinity.territoriality,
    ),
    attractionBias: clamp(
      inward * 0.58 + visual.particles.attraction * 0.27 + gesture.averageCurvature * 0.15,
    ),
    avoidanceBias: clamp(
      gesture.averageCurvature * 0.55 + outward * 0.25 + visual.particles.repulsion * 0.2,
    ),
    resonanceFrequency: clamp(
      visual.motion.orbitStrength * 0.45 +
        gesture.averageCurvature * 0.28 +
        (1 - gesture.averageSpeed) * 0.22 +
        ((seed.length % 11) / 10) * 0.05,
    ),
    preferredBiome,
    energyAffinity: affinity.energy,
  });
}
