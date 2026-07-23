import type { VektorDNA } from "@/features/lab/schemas/dna";
import type { VektorMemory } from "@/features/simulation/schemas/memory";
import type { VektorState } from "@/features/simulation/schemas/state";

export type VektorRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  creator: string;
  dna: VektorDNA;
  previewImageUrl?: string;
  createdAt: string;
  reactionCount: number;
  remixCount: number;
  generation: number;
  releasedAt: string;
  state: VektorState;
  memories: VektorMemory[];
};
