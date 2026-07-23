import { z } from "zod";
import { biomeTypeSchema } from "./biome";

const unit = z.number().finite().min(0).max(1);

export const evolutionPathSchema = z.enum([
  "symbiotic",
  "volatile",
  "transcendent",
  "nomadic",
  "guardian",
]);

export type EvolutionPath = z.infer<typeof evolutionPathSchema>;

export const vektorStatusSchema = z.enum(["dormant", "active", "travelling", "event"]);

export const vektorStateSchema = z
  .object({
    vektorId: z.string().min(1).max(128),
    currentBiome: biomeTypeSchema,
    energy: unit,
    stability: unit,
    evolutionPath: evolutionPathSchema.nullable(),
    evolutionStage: z.number().int().min(0).max(3),
    activeMutationId: z.string().min(1).max(128).nullable(),
    status: vektorStatusSchema,
    lastSimulationAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict();

export type VektorState = z.infer<typeof vektorStateSchema>;
