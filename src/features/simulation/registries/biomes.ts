import { z } from "zod";
import type { Archetype } from "@/features/lab/schemas/dna";
import type { BiomeType } from "../schemas/biome";
import { biomeTypeSchema } from "../schemas/biome";

const biomeDefinitionSchema = z
  .object({
    id: biomeTypeSchema,
    name: z.string().min(1),
    description: z.string().min(1),
    atmosphere: z.string().min(1),
    recommendedArchetypes: z.array(z.enum(["calm", "chaotic", "electric", "organic"])),
    risk: z.enum(["Low", "Measured", "High"]),
    visualTheme: z
      .object({
        background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        secondary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
        fogDensity: z.number().min(0).max(0.2),
        fieldSpeed: z.number().min(0.05).max(3),
      })
      .strict(),
    environmentalRules: z
      .object({
        energyPerHour: z.number().min(-0.2).max(0.2),
        stabilityPerHour: z.number().min(-0.2).max(0.2),
        encounterBias: z.number().min(0).max(1),
        traitBias: z.number().min(0).max(1),
        evolutionPerHour: z.number().min(0).max(0.2),
      })
      .strict(),
    possibleTraits: z.array(z.string().min(1)),
  })
  .strict();

export type BiomeDefinition = z.infer<typeof biomeDefinitionSchema>;

const definitions = [
  {
    id: "void-garden",
    name: "Void Garden",
    description: "A balanced nursery where slow currents reward adaptable and patient life.",
    atmosphere: "Organic drift · low pressure · stable energy",
    recommendedArchetypes: ["organic", "calm"],
    risk: "Low",
    visualTheme: {
      background: "#07070A",
      primary: "#C7A0FF",
      secondary: "#5A886B",
      fogDensity: 0.045,
      fieldSpeed: 0.32,
    },
    environmentalRules: {
      energyPerHour: 0.018,
      stabilityPerHour: 0.014,
      encounterBias: 0.42,
      traitBias: 0.46,
      evolutionPerHour: 0.012,
    },
    possibleTraits: ["Adaptive Veil", "Garden Pulse", "Symbiotic Thread"],
  },
  {
    id: "electric-storm",
    name: "Electric Storm",
    description: "A charged region with rapid energy gain and a measurable stability cost.",
    atmosphere: "Fast current · high charge · unstable pressure",
    recommendedArchetypes: ["electric", "chaotic"],
    risk: "High",
    visualTheme: {
      background: "#03070D",
      primary: "#56D9FF",
      secondary: "#6D46FF",
      fogDensity: 0.025,
      fieldSpeed: 1.7,
    },
    environmentalRules: {
      energyPerHour: 0.052,
      stabilityPerHour: -0.034,
      encounterBias: 0.62,
      traitBias: 0.58,
      evolutionPerHour: 0.018,
    },
    possibleTraits: ["Volatile Arc", "Charged Wake", "Storm Nerve"],
  },
  {
    id: "silent-ocean",
    name: "Silent Ocean",
    description: "A wide, slow field where resonance deepens and social signals travel far.",
    atmosphere: "Deep resonance · broad flow · low turbulence",
    recommendedArchetypes: ["calm", "organic"],
    risk: "Measured",
    visualTheme: {
      background: "#02090C",
      primary: "#43F0CE",
      secondary: "#24658C",
      fogDensity: 0.065,
      fieldSpeed: 0.2,
    },
    environmentalRules: {
      energyPerHour: 0.01,
      stabilityPerHour: 0.026,
      encounterBias: 0.68,
      traitBias: 0.5,
      evolutionPerHour: 0.014,
    },
    possibleTraits: ["Silent Drift", "Resonant Membrane", "Deep Signal"],
  },
  {
    id: "crystal-rift",
    name: "Crystal Rift",
    description: "A fractured frontier where adaptation accelerates and rare changes emerge.",
    atmosphere: "Sharp geometry · mutation pressure · fractured motion",
    recommendedArchetypes: ["chaotic", "electric"],
    risk: "High",
    visualTheme: {
      background: "#09060D",
      primary: "#F0D7FF",
      secondary: "#FF547A",
      fogDensity: 0.035,
      fieldSpeed: 0.9,
    },
    environmentalRules: {
      energyPerHour: -0.008,
      stabilityPerHour: -0.022,
      encounterBias: 0.48,
      traitBias: 0.82,
      evolutionPerHour: 0.028,
    },
    possibleTraits: ["Crystal Fracture", "Rift Sense", "Prismatic Shell"],
  },
] satisfies Array<
  Omit<BiomeDefinition, "recommendedArchetypes"> & {
    recommendedArchetypes: Archetype[];
  }
>;

export const biomeRegistry = Object.fromEntries(
  definitions.map((definition) => [definition.id, biomeDefinitionSchema.parse(definition)]),
) as Record<BiomeType, BiomeDefinition>;

export const biomeList = Object.values(biomeRegistry);

export function getBiomeDefinition(biome: BiomeType): BiomeDefinition {
  return biomeRegistry[biome];
}
