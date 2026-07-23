import { createDNA } from "@/features/lab/engine/dna";
import type { VektorRecord } from "./types";

const definitions = [
  ["ion-moth", "Ion Moth", "electric", "ion-blue", "Restless charge folded into a quiet orbit."],
  ["pale-signal", "Pale Signal", "calm", "pale-signal", "A low-frequency signal from an empty sea."],
  ["verdant-echo", "Verdant Echo", "organic", "toxic-bloom", "Soft symmetry with a feral edge."],
  ["red-shift", "Red Shift", "chaotic", "infrared", "Direction changes preserved as heat."],
  ["solar-nerve", "Solar Nerve", "electric", "solar-flare", "A bright pulse looking for a body."],
  ["abyssal-loop", "Abyssal Loop", "calm", "deep-ocean", "Patient motion beneath the visible field."],
] as const;

export const sampleVektors: VektorRecord[] = definitions.map(([slug, name, archetype, paletteId, description], index) => ({
  id: `sample-${index + 1}`,
  slug,
  name,
  description,
  creator: index % 2 ? "@fieldnotes" : "@vektorix",
  dna: createDNA({ seed: slug, archetype, paletteId }),
  createdAt: new Date(Date.UTC(2026, 6, 12 - index)).toISOString(),
  reactionCount: 84 - index * 9,
  remixCount: 26 - index * 3,
  generation: index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1,
}));

export function getSampleVektor(slug: string) {
  return sampleVektors.find((vektor) => vektor.slug === slug);
}
