import { z } from "zod";

const unit = z.number().finite().min(0).max(1);
const positive = z.number().finite().min(0.01).max(4);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const archetypeSchema = z.enum(["calm", "chaotic", "electric", "organic"]);
export type Archetype = z.infer<typeof archetypeSchema>;

export const countTierSchema = z.enum(["low", "medium", "high"]);

export const vektorDnaSchema = z
  .object({
    version: z.literal(1),
    seed: z.string().min(3).max(96),
    archetype: archetypeSchema,
    palette: z.object({
      primary: hex,
      secondary: hex,
      accent: hex,
      background: hex,
    }).strict(),
    form: z.object({
      symmetry: unit,
      density: unit,
      radius: positive,
      elongation: unit,
      shellThickness: unit,
      coreSize: positive,
    }).strict(),
    motion: z.object({
      speed: unit,
      turbulence: unit,
      pulse: unit,
      orbitStrength: unit,
      flowScale: positive,
      flowStrength: unit,
      elasticity: unit,
    }).strict(),
    surface: z.object({
      roughness: unit,
      metallic: unit,
      fresnelStrength: unit,
      glowStrength: unit,
      opacity: unit,
    }).strict(),
    particles: z.object({
      countTier: countTierSchema,
      spread: unit,
      trailLength: unit,
      attraction: unit,
      repulsion: unit,
    }).strict(),
    audio: z.object({
      enabled: z.boolean(),
      sensitivity: unit,
      bassResponse: unit,
      midResponse: unit,
      trebleResponse: unit,
    }).strict(),
    gesture: z.object({
      signature: z.tuple([unit, unit, unit, unit, unit, unit, unit, unit]),
      averageSpeed: unit,
      averageCurvature: unit,
      directionBias: z.number().finite().min(-1).max(1),
      intensity: unit,
    }).strict(),
    ancestry: z.object({
      generation: z.number().int().min(1).max(999),
      parentIds: z.array(z.string().min(1).max(128)).max(2),
      mutationRate: z.number().finite().min(0).max(0.2),
    }).strict().optional(),
  })
  .strict();

export type VektorDNA = z.infer<typeof vektorDnaSchema>;

export const publishVektorSchema = z.object({
  name: z.string().trim().min(2).max(32),
  description: z.string().trim().max(240).optional().default(""),
  dna: vektorDnaSchema,
  previewImageUrl: z.string().max(1_500_000).optional(),
});

export type PublishVektorInput = z.infer<typeof publishVektorSchema>;
