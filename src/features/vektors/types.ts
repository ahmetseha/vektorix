import type { VektorDNA } from "@/features/lab/schemas/dna";

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
};
