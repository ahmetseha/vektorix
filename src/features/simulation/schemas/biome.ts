import { z } from "zod";

export const biomeTypeSchema = z.enum([
  "void-garden",
  "electric-storm",
  "silent-ocean",
  "crystal-rift",
]);

export type BiomeType = z.infer<typeof biomeTypeSchema>;

export const energyAffinitySchema = z.enum(["kinetic", "resonant", "volatile", "adaptive"]);

export type EnergyAffinity = z.infer<typeof energyAffinitySchema>;
