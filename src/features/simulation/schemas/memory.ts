import { z } from "zod";

export const memoryTypeSchema = z.enum([
  "awakened",
  "released",
  "entered-biome",
  "left-biome",
  "energy-change",
  "stability-change",
]);

export type MemoryType = z.infer<typeof memoryTypeSchema>;

export const vektorMemorySchema = z
  .object({
    id: z.string().min(1).max(128),
    vektorId: z.string().min(1).max(128),
    type: memoryTypeSchema,
    title: z.string().min(1).max(96),
    description: z.string().min(1).max(320),
    metadata: z.record(z.string(), z.unknown()),
    importance: z.number().finite().min(0).max(1),
    createdAt: z.string().datetime(),
  })
  .strict();

export type VektorMemory = z.infer<typeof vektorMemorySchema>;
export type GeneratedMemory = Omit<VektorMemory, "id">;
