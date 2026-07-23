import { z } from "zod";
import { biomeTypeSchema, energyAffinitySchema } from "@/features/simulation/schemas/biome";

const unit = z.number().finite().min(0).max(1);
const signedUnit = z.number().finite().min(-1).max(1);
const positive = z.number().finite().min(0.01).max(4);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const archetypeSchema = z.enum(["calm", "chaotic", "electric", "organic"]);
export type Archetype = z.infer<typeof archetypeSchema>;

export const countTierSchema = z.enum(["low", "medium", "high"]);

export const gestureSchema = z
  .object({
    signature: z.tuple([unit, unit, unit, unit, unit, unit, unit, unit]),
    averageSpeed: unit,
    averageCurvature: unit,
    directionBias: signedUnit,
    radialBias: signedUnit,
    variety: unit,
    intensity: unit,
  })
  .strict();

export const visualDnaSchema = z
  .object({
    archetype: archetypeSchema,
    palette: z
      .object({
        primary: hex,
        secondary: hex,
        accent: hex,
        background: hex,
      })
      .strict(),
    form: z
      .object({
        symmetry: unit,
        density: unit,
        radius: positive,
        elongation: unit,
        shellThickness: unit,
        coreSize: positive,
      })
      .strict(),
    motion: z
      .object({
        speed: unit,
        turbulence: unit,
        pulse: unit,
        orbitStrength: unit,
        flowScale: positive,
        flowStrength: unit,
        elasticity: unit,
      })
      .strict(),
    surface: z
      .object({
        roughness: unit,
        metallic: unit,
        fresnelStrength: unit,
        glowStrength: unit,
        opacity: unit,
      })
      .strict(),
    particles: z
      .object({
        countTier: countTierSchema,
        spread: unit,
        trailLength: unit,
        attraction: unit,
        repulsion: unit,
      })
      .strict(),
    audio: z
      .object({
        enabled: z.boolean(),
        sensitivity: unit,
        bassResponse: unit,
        midResponse: unit,
        trebleResponse: unit,
      })
      .strict(),
    gesture: gestureSchema,
  })
  .strict();

export type VisualDNA = z.infer<typeof visualDnaSchema>;

export const behavioralDnaSchema = z
  .object({
    curiosity: unit,
    sociability: unit,
    stability: unit,
    adaptability: unit,
    territoriality: unit,
    attractionBias: unit,
    avoidanceBias: unit,
    resonanceFrequency: unit,
    preferredBiome: biomeTypeSchema,
    energyAffinity: energyAffinitySchema,
  })
  .strict();

export type BehavioralDNA = z.infer<typeof behavioralDnaSchema>;

export const ancestrySchema = z
  .object({
    generation: z.number().int().min(1).max(999),
    parentIds: z.array(z.string().min(1).max(128)).max(2),
    mutationRate: z.number().finite().min(0).max(0.2),
  })
  .strict();

export const vektorDnaSchema = z
  .object({
    version: z.literal(2),
    seed: z.string().min(3).max(96),
    visual: visualDnaSchema,
    behavioral: behavioralDnaSchema,
    ancestry: ancestrySchema.optional(),
  })
  .strict();

export type VektorDNA = z.infer<typeof vektorDnaSchema>;

export const legacyVektorDnaSchema = z
  .object({
    version: z.literal(1),
    seed: z.string().min(3).max(96),
    archetype: archetypeSchema,
    palette: visualDnaSchema.shape.palette,
    form: visualDnaSchema.shape.form,
    motion: visualDnaSchema.shape.motion,
    surface: visualDnaSchema.shape.surface,
    particles: visualDnaSchema.shape.particles,
    audio: visualDnaSchema.shape.audio,
    gesture: gestureSchema.omit({ radialBias: true, variety: true }),
    ancestry: ancestrySchema.optional(),
  })
  .strict();

export type LegacyVektorDNA = z.infer<typeof legacyVektorDnaSchema>;

export const publishVektorSchema = z.object({
  name: z.string().trim().min(2).max(32),
  description: z.string().trim().max(240).optional().default(""),
  dna: z.unknown(),
  previewImageUrl: z.string().max(1_500_000).optional(),
  initialBiome: biomeTypeSchema,
});

export type PublishVektorInput = Omit<z.infer<typeof publishVektorSchema>, "dna"> & {
  dna: VektorDNA;
};
