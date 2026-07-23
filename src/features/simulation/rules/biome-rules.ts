import type { BehavioralDNA } from "@/features/lab/schemas/dna";
import type { BiomeDefinition } from "../registries/biomes";

export function describeBiomeCompatibility(
  biome: BiomeDefinition,
  behavioral: BehavioralDNA,
): string {
  if (behavioral.preferredBiome === biome.id) {
    return "Strong behavioral resonance";
  }
  if (biome.id === "silent-ocean" && behavioral.resonanceFrequency >= 0.62) {
    return "Deep resonance potential";
  }
  if (biome.id === "crystal-rift" && behavioral.adaptability >= 0.62) {
    return "High adaptation potential";
  }
  if (biome.id === "electric-storm" && behavioral.stability < 0.42) {
    return "Volatile but responsive";
  }
  return "Uncertain environmental response";
}
